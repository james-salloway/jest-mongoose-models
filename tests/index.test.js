/** @jest-environment node */
const buildMongooseModels = require('../src/index');

describe('unit', () => {
  test('calling without parameters should throw an error', () => {
    expect(() => buildMongooseModels()).toThrow('Invalid data type for requiredModels parameter. Expected object, received undefined');
  });

  test('calling with a non object as first parameter should throw an error', () => {
    expect(() => buildMongooseModels(jest.fn())).toThrow('Invalid data type for requiredModels parameter. Expected object, received function');
    expect(() => buildMongooseModels('string')).toThrow('Invalid data type for requiredModels parameter. Expected object, received string');
    expect(() => buildMongooseModels(100)).toThrow('Invalid data type for requiredModels parameter. Expected object, received number');
    expect(() => buildMongooseModels(true)).toThrow('Invalid data type for requiredModels parameter. Expected object, received boolean');
    expect(() => buildMongooseModels([])).toThrow('Invalid data type for requiredModels parameter. Expected object, received array');
  });

  test('calling with empty object should return empty object', () => {
    expect(buildMongooseModels({})).toEqual({});
  });

  test('calling with object that has multiple levels of properties should return properties mapped correctly', () => {
    const passedObject = {
      DbName: {
        CollectionName: {
          'findOne.lean.exec': {
            split: 'levels',
          },
        },
      },
    };

    const models = buildMongooseModels(passedObject);

    expect(models).toHaveProperty('DbName');
    expect(models.DbName).toHaveProperty('CollectionName');
    expect(models.DbName.CollectionName).toHaveProperty('findOne');

    expect(models.DbName.CollectionName.findOne.name).toEqual('mockConstructor');
    expect(models.DbName.CollectionName.findOne()).toHaveProperty('lean');
    expect(models.DbName.CollectionName.findOne().lean.name).toEqual('mockConstructor');
    expect(models.DbName.CollectionName.findOne().lean()).toHaveProperty('exec');
    expect(models.DbName.CollectionName.findOne().lean().exec.name).toEqual('mockConstructor');
    expect(models.DbName.CollectionName.findOne().lean().exec()).toEqual({ split: 'levels' });
  });

  test('calling with object that has one level of properties should return properties mapped correctly', () => {
    const passedObject = {
      DbName: {
        CollectionName: {
          findOneAndUpdate: {
            updatedData: {
              a: 1,
              b: 2,
              c: 3,
            },
          },
        },
      },
    };

    const models = buildMongooseModels(passedObject);

    expect(models).toHaveProperty('DbName');
    expect(models.DbName).toHaveProperty('CollectionName');
    expect(models.DbName.CollectionName).toHaveProperty('findOneAndUpdate');
    expect(models.DbName.CollectionName.findOneAndUpdate.name).toEqual('mockConstructor');
    expect(models.DbName.CollectionName.findOneAndUpdate()).toEqual({
      updatedData: {
        a: 1,
        b: 2,
        c: 3,
      },
    });
  });

  test('calling with a function property at collection level should convert the result function into a mocked equivalent', () => {
    const passedObject = {
      DbName: {
        CollectionName: {
          findOneAndUpdate: () => 'Updated Stats',
        },
      },
    };

    const models = buildMongooseModels(passedObject);

    expect(models).toHaveProperty('DbName');
    expect(models.DbName).toHaveProperty('CollectionName');
    expect(models.DbName.CollectionName).toHaveProperty('findOneAndUpdate');
    expect(models.DbName.CollectionName.findOneAndUpdate.name).toEqual('mockConstructor');
    expect(models.DbName.CollectionName.findOneAndUpdate()).toEqual('Updated Stats');
  });

  test('calling with a useConstructor property at collection level should convert the collection object into a mocked function', () => {
    const passedObject = {
      DbName: {
        CollectionName: {
          useConstructor: true,
          findOneAndUpdate: {
            result: 'Updated Stats',
          },
        },
      },
    };

    const models = buildMongooseModels(passedObject);

    expect(models).toHaveProperty('DbName');
    expect(models.DbName).toHaveProperty('CollectionName');
    expect(models.DbName.CollectionName.name).toEqual('mockConstructor');
    expect(models.DbName.CollectionName()).toHaveProperty('findOneAndUpdate');
    expect(models.DbName.CollectionName().findOneAndUpdate.name).toEqual('mockConstructor');
    expect(models.DbName.CollectionName().findOneAndUpdate()).toEqual({ result: 'Updated Stats' });
  });

  test('calling with a toObject property at result level should generate a toObject returnValue that equals the return value', () => {
    const passedObject = {
      DbName: {
        CollectionName: {
          useConstructor: true,
          findOneAndUpdate: {
            toObject: true,
            result: 'Updated Stats',
          },
        },
      },
    };

    const models = buildMongooseModels(passedObject);

    expect(models).toHaveProperty('DbName');
    expect(models.DbName).toHaveProperty('CollectionName');
    expect(models.DbName.CollectionName.name).toEqual('mockConstructor');
    expect(models.DbName.CollectionName()).toHaveProperty('findOneAndUpdate');
    expect(models.DbName.CollectionName().findOneAndUpdate.name).toEqual('mockConstructor');
    expect(models.DbName.CollectionName().findOneAndUpdate()).toEqual({ toObject: expect.any(Function), result: 'Updated Stats' });
    expect(typeof models.DbName.CollectionName().findOneAndUpdate().toObject).toEqual('function');
    expect(models.DbName.CollectionName().findOneAndUpdate().toObject()).toEqual({ toObject: true, result: 'Updated Stats' });
  });

  test('calling with a Promise based function property at collection level should convert the result function into a mocked equivalent', async () => {
    const passedObject = {
      DbName: {
        CollectionName: {
          findOneAndUpdate: Promise.resolve('Updated Stats'),
        },
      },
    };

    const models = buildMongooseModels(passedObject);

    expect(models).toHaveProperty('DbName');
    expect(models.DbName).toHaveProperty('CollectionName');
    expect(models.DbName.CollectionName).toHaveProperty('findOneAndUpdate');
    expect(models.DbName.CollectionName.findOneAndUpdate.name).toEqual('mockConstructor');
    expect(await models.DbName.CollectionName.findOneAndUpdate()).toEqual('Updated Stats');
  });
});
