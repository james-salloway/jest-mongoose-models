const clone = require('rfdc')();
const merge = require('lodash.merge');

function convertMappedCallSteps(template) {
  return Object.keys(template).reduce((step, key) => {
    if (typeof template[key] === 'object') {
      return { ...step, [key]: jest.fn().mockImplementation(() => convertMappedCallSteps(template[key])) };
    }

    return { ...step, [key]: template[key] };
  }, {});
}

function mapCallSteps(model) {
  const mappedModel = {};
  const keys = Object.keys(model);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const mappedCall = key.split('.').reverse().reduce((callChain, stepName) => {
      if (Object.keys(callChain).length === 0) {
        const returnValue = model[key];
        if (typeof returnValue === 'undefined') {
          return { [stepName]: jest.fn().mockReturnValue() };
        }

        if (returnValue === null) {
          return { [stepName]: jest.fn().mockReturnValue(null) };
        }

        const { toObject, ...copiedValue } = clone(returnValue);

        if (toObject === true) {
          merge(returnValue, { toObject: () => copiedValue });
        }

        if (returnValue instanceof Promise) {
          return { [stepName]: jest.fn().mockImplementation(() => returnValue) };
        }

        if (typeof returnValue === 'function') {
          return {
            [stepName]: returnValue.name === 'mockConstructor' ? returnValue : jest.fn().mockImplementation((...args) => returnValue(args)),
          };
        }

        return { [stepName]: jest.fn().mockReturnValue(returnValue) };
      }

      return { [stepName]: callChain };
    }, {});

    merge(mappedModel, mappedCall);
  }

  return mappedModel;
}

const buildMongooseModels = (requiredModels) => {
  const isPromise = requiredModels instanceof Promise;
  const isArray = Array.isArray(requiredModels);
  if (isPromise || typeof requiredModels !== 'object' || isArray) {
    let returnType = typeof requiredModels;
    if (isPromise) {
      returnType = 'Promise';
    }

    if (isArray) {
      returnType = 'array';
    }

    throw new Error(`Invalid data type for requiredModels parameter. Expected object, received ${returnType}`);
  }

  return Object.keys(requiredModels).reduce((properties, key) => {
    const { useConstructor, ...pickedStepKeys } = requiredModels[key];
    const model = mapCallSteps(pickedStepKeys);
    const rebuiltModel = convertMappedCallSteps(model);
    return { ...properties, [key]: useConstructor === true ? jest.fn(() => rebuiltModel) : rebuiltModel };
  }, {});
};

module.exports = buildMongooseModels;
