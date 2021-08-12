/** @jest-environment node */
const buildMongooseModels = require('../src/index');

describe('unit', () => {
  test('calling without parameters should throw an error', () => {
    expect(() => buildMongooseModels()).toThrow('Invalid data type for requiredModels parameter. Expected object, received undefined');
  });

  test('calling with a non object as first parameter should throw an error', () => {
    expect(() => buildMongooseModels()).toThrow('Invalid data type for requiredModels parameter. Expected object, received undefined');
    expect(() => buildMongooseModels(jest.fn())).toThrow('Invalid data type for requiredModels parameter. Expected object, received function');
    expect(() => buildMongooseModels('string')).toThrow('Invalid data type for requiredModels parameter. Expected object, received string');
    expect(() => buildMongooseModels(100)).toThrow('Invalid data type for requiredModels parameter. Expected object, received number');
    expect(() => buildMongooseModels(true)).toThrow('Invalid data type for requiredModels parameter. Expected object, received boolean');
    expect(() => buildMongooseModels([])).toThrow('Invalid data type for requiredModels parameter. Expected object, received array');
    expect(() => buildMongooseModels(Promise.resolve())).toThrow('Invalid data type for requiredModels parameter. Expected object, received Promise');
    expect(() => buildMongooseModels(new Promise(() => {}))).toThrow('Invalid data type for requiredModels parameter. Expected object, received Promise');
  });

  test('calling with empty object should return empty object', () => {
    expect(buildMongooseModels({})).toEqual({});
  });

  test('calling with object that has multiple levels of properties should return properties mapped correctly', () => {
    const passedObject = {
      ModelName: {
        'findOne.lean.exec': {
          split: 'levels',
        },
        'findOne.exec': {
          result: 'values',
        },
        findOneAndUpdate: null,
      },
    };

    const models = buildMongooseModels(passedObject);

    expect(models).toHaveProperty('ModelName');
    expect(models).toHaveProperty('ModelName');
    expect(models.ModelName).toHaveProperty('findOne');

    expect(models.ModelName.findOne.name).toEqual('mockConstructor');
    expect(models.ModelName.findOne()).toHaveProperty('lean');
    expect(models.ModelName.findOne().lean.name).toEqual('mockConstructor');
    expect(models.ModelName.findOne().lean()).toHaveProperty('exec');
    expect(models.ModelName.findOne().lean().exec.name).toEqual('mockConstructor');
    expect(models.ModelName.findOne().lean().exec()).toEqual({ split: 'levels' });

    expect(models.ModelName.findOne()).toHaveProperty('exec');
    expect(models.ModelName.findOne().exec.name).toEqual('mockConstructor');
    expect(models.ModelName.findOne().exec()).toEqual({ result: 'values' });

    expect(models.ModelName).toHaveProperty('findOneAndUpdate');
    expect(models.ModelName.findOneAndUpdate.name).toEqual('mockConstructor');
    expect(models.ModelName.findOneAndUpdate()).toEqual(null);
  });

  test('calling with object that has one level of properties should return properties mapped correctly', () => {
    const passedObject = {
      ModelName: {
        findOneAndUpdate: {
          updatedData: {
            a: 1,
            b: 2,
            c: 3,
          },
        },
      },
    };

    const models = buildMongooseModels(passedObject);

    expect(models).toHaveProperty('ModelName');
    expect(models.ModelName).toHaveProperty('findOneAndUpdate');
    expect(models.ModelName.findOneAndUpdate.name).toEqual('mockConstructor');
    expect(models.ModelName.findOneAndUpdate()).toEqual({
      updatedData: {
        a: 1,
        b: 2,
        c: 3,
      },
    });
  });

  test('calling with a function property at collection level should convert the result function into a mocked equivalent', () => {
    const passedObject = {
      ModelName: {
        findOneAndUpdate: () => 'Updated Stats',
      },
    };

    const models = buildMongooseModels(passedObject);

    expect(models).toHaveProperty('ModelName');
    expect(models.ModelName).toHaveProperty('findOneAndUpdate');
    expect(models.ModelName.findOneAndUpdate.name).toEqual('mockConstructor');
    expect(models.ModelName.findOneAndUpdate()).toEqual('Updated Stats');
  });

  test('calling with a function property with arguments at collection level should convert the result function into a mocked equivalent', () => {
    const passedObject = {
      ModelName: {
        findOneAndUpdate: (exampleString) => `Updated Stats for ${exampleString}`,
      },
    };

    const models = buildMongooseModels(passedObject);

    expect(models).toHaveProperty('ModelName');
    expect(models.ModelName).toHaveProperty('findOneAndUpdate');
    expect(models.ModelName.findOneAndUpdate.name).toEqual('mockConstructor');
    expect(models.ModelName.findOneAndUpdate('Testing value')).toEqual('Updated Stats for Testing value');
  });

  test('calling with a useConstructor property at collection level should convert the collection object into a mocked function', () => {
    const passedObject = {
      ModelName: {
        useConstructor: true,
        findOneAndUpdate: {
          result: 'Updated Stats',
        },
      },
    };

    const models = buildMongooseModels(passedObject);

    expect(models).toHaveProperty('ModelName');
    expect(models.ModelName.name).toEqual('mockConstructor');
    expect(models.ModelName()).toHaveProperty('findOneAndUpdate');
    expect(models.ModelName().findOneAndUpdate.name).toEqual('mockConstructor');
    expect(models.ModelName().findOneAndUpdate()).toEqual({ result: 'Updated Stats' });

    // eslint-disable-next-line prefer-destructuring
    const ConstructorBasedModel = models.ModelName;

    expect(ConstructorBasedModel.name).toEqual('mockConstructor');
    expect(new ConstructorBasedModel()).toHaveProperty('findOneAndUpdate');
    expect(new ConstructorBasedModel().findOneAndUpdate.name).toEqual('mockConstructor');
    expect(new ConstructorBasedModel().findOneAndUpdate()).toEqual({ result: 'Updated Stats' });
  });

  test('calling with a toObject property at result level should generate a toObject returnValue that equals the return value', () => {
    const passedObject = {
      ModelName: {
        useConstructor: true,
        findOneAndUpdate: {
          toObject: true,
          result: 'Updated Stats',
        },
      },
    };

    const models = buildMongooseModels(passedObject);

    expect(models).toHaveProperty('ModelName');
    expect(models.ModelName.name).toEqual('mockConstructor');
    expect(models.ModelName()).toHaveProperty('findOneAndUpdate');
    expect(models.ModelName().findOneAndUpdate.name).toEqual('mockConstructor');
    expect(models.ModelName().findOneAndUpdate()).toEqual({ toObject: expect.any(Function), result: 'Updated Stats' });
    expect(typeof models.ModelName().findOneAndUpdate().toObject).toEqual('function');
    expect(models.ModelName().findOneAndUpdate().toObject()).toEqual({ result: 'Updated Stats' });
  });

  test('calling with a Promise based function property at collection level should convert the result function into a mocked equivalent', async () => {
    const passedObject = {
      ModelName: {
        findOneAndUpdate: Promise.resolve('Updated Stats'),
        findOne: Promise.reject(new Error('Failed to find data')),
      },
    };

    const models = buildMongooseModels(passedObject);

    expect(models).toHaveProperty('ModelName');

    expect(models.ModelName).toHaveProperty('findOneAndUpdate');
    expect(models.ModelName.findOneAndUpdate.name).toEqual('mockConstructor');
    expect(await models.ModelName.findOneAndUpdate()).toEqual('Updated Stats');

    expect(models.ModelName).toHaveProperty('findOne');
    expect(models.ModelName.findOne.name).toEqual('mockConstructor');
    await models.ModelName.findOne().catch((e) => expect(e.message).toEqual('Failed to find data'));
  });

  // https://github.com/Jimsalad/jest-mongoose-models/issues/5
  test('calling with an explicit value of undefined should be handled properly', () => {
    const passedObject = {
      ModelName: {
        'findOne.exec': undefined,
      },
    };

    const models = buildMongooseModels(passedObject);
    expect(models.ModelName).toHaveProperty('findOne');
    expect(models.ModelName.findOne.name).toEqual('mockConstructor');
    expect(models.ModelName.findOne()).toHaveProperty('exec');
    expect(models.ModelName.findOne().exec.name).toEqual('mockConstructor');
    expect(models.ModelName.findOne().exec()).toEqual(undefined);
  });

  // https://github.com/Jimsalad/jest-mongoose-models/issues/7
  test('calling with a mocked function should return mocked function argument value as implemented', () => {
    const passedObject = {
      ModelName: {
        create: jest.fn((returnValue) => returnValue),
      },
    };

    const models = buildMongooseModels(passedObject);
    const callValue = { valueA: 'a', valueB: 'b', valueNum: 12 };
    expect(models.ModelName).toHaveProperty('create');
    expect(models.ModelName.create.name).toEqual('mockConstructor');
    expect(models.ModelName.create(callValue)).toEqual(callValue);
  });

  test('calling with a nested mocked function should return mocked function argument values as implemented', () => {
    const passedObject = {
      ModelName: {
        create: jest.fn((returnValue) => ({ ...returnValue, exec: (nestedReturnValue) => nestedReturnValue })),
      },
    };

    const models = buildMongooseModels(passedObject);
    const callValue = { valueA: 'a', valueB: 'b', valueNum: 12 };
    expect(models.ModelName).toHaveProperty('create');
    expect(models.ModelName.create.name).toEqual('mockConstructor');
    expect(models.ModelName.create(callValue)).toEqual({ ...callValue, exec: expect.any(Function) });
    expect(models.ModelName.create(callValue).exec.name).toEqual('exec');
    expect(models.ModelName.create(callValue).exec('Test Test')).toEqual('Test Test');
  });

  // https://github.com/Jimsalad/jest-mongoose-models/issues/9
  test('calling with a multi step call chain should allow assertions with arguments on the intemediary chain step', () => {
    const passedObject = {
      ModelName: {
        'find.populate.exec': [
          { _id: 1 },
          { _id: 2 },
          { _id: 3 },
          { _id: 4 },
        ],
      },
    };

    const models = buildMongooseModels(passedObject);
    expect(models.ModelName).toHaveProperty('find');
    expect(models.ModelName.find.name).toEqual('mockConstructor');
    expect(models.ModelName.find()).toHaveProperty('populate');
    expect(models.ModelName.find().populate.name).toEqual('mockConstructor');
    expect(models.ModelName.find().populate()).toHaveProperty('exec');
    expect(models.ModelName.find().populate().exec.name).toEqual('mockConstructor');
    expect(models.ModelName.find().populate().exec()).toEqual([
      { _id: 1 },
      { _id: 2 },
      { _id: 3 },
      { _id: 4 },
    ]);

    models.ModelName.find('call value one').populate('call value two').exec();

    expect(models.ModelName.find).toHaveBeenCalledWith('call value one');
    expect(models.ModelName.find().populate).toHaveBeenCalledWith('call value two');
    expect(models.ModelName.find().populate().exec).toHaveBeenCalledWith();
  });
});
