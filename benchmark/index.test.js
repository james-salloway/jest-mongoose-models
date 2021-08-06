const { PerformanceObserver, performance } = require('perf_hooks');
const buildMongooseModels = require('../src');

const modelToMock = {
  ModelName: {
    findOne: {},
    findOneAndUpdate: Promise.resolve({}),
    updateMany: Promise.reject(new Error('Failed to update')),
    'insertMany.exec': true,
  },
  AnotherModelName: {
    findOne: 'example',
    'find.lean.exec': 4,
    insertOne: { toObject: true, result: 'exampleResultValue' },
    aggregate: [
      { position: 1 },
      { position: 2 },
      { position: 3 },
    ],
  },
  ConstructorBasedModel: {
    useConstructor: true,
    'findOne.exec': { result: 'value' },
  },
};

const COUNT = 100000;

function transformObserverEntry(entry) {
  return {
    operations: COUNT,
    duration: entry.duration,
    throughput: `~${(COUNT / (entry.duration / 1000)).toFixed(0)} ops/second`,
  };
}

// eslint-disable-next-line no-console
const observer = new PerformanceObserver((items) => console.log(items.getEntries().map((entry) => transformObserverEntry(entry))));
observer.observe({ entryTypes: ['measure'] });

performance.mark('iterations');
test('benchmark', () => {
  for (let i = 0; i < COUNT; i++) {
    buildMongooseModels(modelToMock);
  }

  performance.mark('endIterations');
  performance.measure('Total', 'iterations', 'endIterations');
});
