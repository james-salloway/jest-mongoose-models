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
        const copiedValue = clone(returnValue);

        if (Object.prototype.hasOwnProperty.call(returnValue, 'toObject') && returnValue.toObject === true) {
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
  }

  return mappedModel;
}

const buildMongooseModels = (requiredModels) => {
  if (typeof requiredModels !== 'object' || Array.isArray(requiredModels)) {
    throw new Error(`Invalid data type for requiredModels parameter. Expected object, received ${Array.isArray(requiredModels) ? 'array' : typeof requiredModels}`);
  }

  return Object.keys(requiredModels).reduce((properties, key) => {
    const { useConstructor, ...pickedStepKeys } = requiredModels[key];
    const model = mapCallSteps(pickedStepKeys);
    const rebuiltModel = convertMappedCallSteps(model);
    return { ...properties, [key]: useConstructor === true ? jest.fn(() => rebuiltModel) : rebuiltModel };
  }, {});
};

module.exports = buildMongooseModels;
