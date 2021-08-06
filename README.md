# Jest Mongoose Models

[![npm](https://img.shields.io/npm/v/jest-mongoose-models)](https://www.npmjs.com/package/jest-mongoose-models)
[![GitHub](https://img.shields.io/github/license/jimsalad/jest-mongoose-models)](https://github.com/jimsalad/jest-mongoose-models/blob/master/LICENSE)
<!-- [![GitHub Workflow Status](https://img.shields.io/github/workflow/status/jimsalad/jest-mongoose-models/Node.js%20CI)](https://github.com/jimsalad/jest-mongoose-models/actions/workflows/ci.yml) -->


This package provides a function to generate mock [Mongoose](https://mongoosejs.com/docs/) model structures, to be used during [Jest](https://jestjs.io/) tests.

```javascript
import buildMongooseModels from 'jest-mongoose-models';

buldMongooseModels({
    ModelName: {
        find: 'expected result'
    }
});

```

## Motivation

This package was created to allow unit testing of Mongoose model calls when you are only interested in the call itself.

## Installation

**yarn**

`yarn add jest-mongoose-models --dev`

**npm**

`npm install jest-mongoose-models -D`

## Usage

### Importing the package

Supports both CommonJS & ECMAScript modules.

*CommonJS*
```javascript
const buildMongooseModels = require('jest-mongoose-models');
```

*ECMAScript*
```javascript
import buildMongooseModels from 'jest-mongoose-models';
```


## Function parameters

The function accepts a single parameter, `requiredModels`, which is expected to be an object. The function will throw an `Error` if you provide incorrect parameters. 

### Parameter property keys

`requiredModels` is expected to be an object.
The keys should match the name of each model.
The values for these keys should be an object containing the relevant methods you would like to mock.

```javascript
const models = buildMongooseModels({
    ModelNameOne: {...},
    ModelNameTwo: {...},
    ModelNameThree: {...}
})

```

### Paramater property values

Method keys can be written as a singular mongoose method to call, or as a method chain using dot notation. Method values should be set as the expected result of the query or query chain.

```javascript
const models = buildMongooseModels({
    ModelName: {
        find: 'Return Value',
        'findOne.lean.exec': { result: 'value' },
    }
});

```

Allowed return values are:
```
null
string
number
boolean
object
array
Promise
functions (with or without parameters)
```

### Chained mocked methods

For each method name in a chain, a new mocked method will be generated with the return value as an object containing the succeeding method as a mocked function property.
This allows you to write assertions based around each individual call in the chain, along with their provided values.

*Mongoose*
```javascript
ModelName.find({ _id: '000000000000000000000001' }).lean();
```

*Unit test*
```javascript
const models = buildMongooseModels({
    ModelName: {
        'find.lean': { result: 'value' },
    }
});

expect(models.ModelName.find()).toHaveBeenCalledWith({ _id: '000000000000000000000001' });
expect(models.ModelName.find().lean()).toHaveBeenCalledWith();
expect(models.ModelName.find().lean()).toEqual({ result: 'value' });

```

### Partially matching mocked method chains
Method chains that contain partial matches in their structure will be combined up until their paths diverge. For example, `find.exec` and `find.lean.exec` will be collapsed into a `find` property that contains both a `lean` property and `exec` property. The `lean` property will also contain an `exec` property.

```javascript

const buildMongooseModels = ({
    ModelName: {
        'find.exec': 'exec result',
        'find.lean.exec': 'lean exec result',
    }
});

expect(models.ModelName.find().exec()).toEqual('exec result');
expect(models.ModelName.find().lean().exec()).toEqual('lean exec result');

```



### isObject
If you have a `toObject` call that needs mocking, you can set a `toObject` property to `true` as part of the method return value. This `toObject` property will then be converted into a mock function which returns the original value minus the `toObject` parameter.

```javascript

const buildMongooseModels = ({
    ModelName: {
        find: {
            toObject: true,
            result: 'return value',
        },
    }
});

expect(models.ModelName.find()).toEqual({ toObject: (...), result: 'return value'});
expect(models.ModelName.find().toObject()).toEqual({ result: 'return value' });

```



### useConstructor
If you need to mock a constructed instance of a model, you can do so by setting a `useConstructor` property to `true ` as part of the model object. This will mock the implementation of the model object, allowing you to execute as a function or use the `new` operator.

```javascript

const buildMongooseModels = ({
    ModelName: {
        useConstructor: true,
        find: 'data',
    }
});

const ConstructorBasedModel = models.ModelName;
expect(new ConstructorBasedModel().find()).toEqual('data');

```

## Benchmarks

Benchmarking can be ran via `yarn benchmark`. This benchmark is ran as a test, as this is the only expected environment for this package.

## Testing

Tests can be ran via `yarn test`.


## License
Jest Mongoose Models is  [MIT Licensed](https://github.com/jimsalad/jest-mongoose-models/blob/master/LICENSE).