const clone = require('rfdc')();
const get = require('lodash.get');
const has = require('lodash.has');
const pick = require('lodash.pick');
const merge = require('lodash.merge');
const zipobject = require('lodash.zipobject');

function convertMappedCallSteps(template) {
  const step = {};
  Object.keys(template).forEach((key) => {
    if (typeof template[key] === 'object') {
      const children = convertMappedCallSteps(template[key]);
      step[key] = jest.fn().mockImplementation(() => children);
    } else {
      step[key] = template[key];
    }
  });

  return step;
}

function mapCallSteps(model) {
  const mappedModel = {};
  Object.keys(model).forEach((key) => {
    const mappedCall = key.split('.').reverse().reduce((callChain, stepName) => {
      if (Object.keys(callChain).length === 0) {
        const returnValue = model[key];
        const copiedValue = clone(returnValue);

        if (has(returnValue, 'toObject') && returnValue.toObject === true) {
          merge(returnValue, { toObject: () => copiedValue });
        }

        if (returnValue instanceof Promise) {
          return { [stepName]: jest.fn().mockResolvedValue(returnValue) };
        }

        if (typeof returnValue === 'function') {
          return {
            [stepName]: jest.fn().mockImplementation((...args) => returnValue(args)),
          };
        }

        return { [stepName]: jest.fn().mockReturnValue(returnValue) };
      }

      return { [stepName]: callChain };
    }, {});

    merge(mappedModel, mappedCall);
  });

  return mappedModel;
}

const buildMongooseModels = (requiredModels) => {
  if (typeof requiredModels !== 'object' || Array.isArray(requiredModels)) {
    throw new Error(`Invalid data type for requiredModels parameter. Expected object, received ${Array.isArray(requiredModels) ? 'array' : typeof requiredModels}`);
  }
  const keys = Object.keys(requiredModels);
  const models = zipobject(keys, new Array(keys.length).fill({}));

  keys.forEach((db) => {
    Object.keys(requiredModels[db]).forEach((modelKey) => {
      const filteredStepKeys = pick(requiredModels[db][modelKey], Object.keys(requiredModels[db][modelKey]).filter((step) => !['useConstructor'].includes(step)));
      const model = mapCallSteps(filteredStepKeys);
      const rebuiltModel = convertMappedCallSteps(model);
      if (get(requiredModels[db][modelKey], 'useConstructor', false)) {
        models[db][modelKey] = jest.fn(() => rebuiltModel);
      } else {
        models[db][modelKey] = rebuiltModel;
      }
    });
  });

  return models;
};

module.exports = buildMongooseModels;
