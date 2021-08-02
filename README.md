# Jest Mongoose Models

[![npm](https://img.shields.io/npm/v/jest-mongoose-models)](https://www.npmjs.com/package/jest-mongoose-models)
[![GitHub](https://img.shields.io/github/license/jimsalad/jest-mongoose-models)](https://github.com/jimsalad/jest-mongoose-models/blob/master/LICENSE)
<!-- [![GitHub Workflow Status](https://img.shields.io/github/workflow/status/jimsalad/jest-mongoose-models/Node.js%20CI)](https://github.com/jimsalad/jest-mongoose-models/actions/workflows/ci.yml) -->


This package provides a function to generate mock [Mongoose](https://mongoosejs.com/docs/) model structures, to be used during [Jest](https://jestjs.io/) tests.

- :white_check_mark: 100% code coverage

## Installation

**yarn**

`yarn add jest-mongoose-models --dev`

**npm**

`npm install jest-mongoose-models -D`

## Usage

#### Importing the package

Supports both CommonJS & ECMAScript modules.

*CommonJS*
```javascript
const buildMongooseModels = require('jest-mongoose-models');
```

*ECMAScript*
```javascript
import buildMongooseModels from 'jest-mongoose-models';
```
