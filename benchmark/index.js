const { PerformanceObserver, performance } = require('perf_hooks');
const buildMongooseModels = require('../src');

const modelToMock = {
  Account: {
    'findOne.lean.exec': { example: 'value', test: 'result', sample: 'data' },
    findOneAndUpdate: { resultValue: 'completedUpdate' },
    aggregate: { aggregateComplete: true },
  },
};

const COUNT = 1000000;

function transformObserverEntry(entry) {
  return {
    operations: COUNT,
    duration: entry.duration,
    throughput: `~${(COUNT / (entry.duration / 1000)).toFixed(0)} ops/second`,
  };
}

module.exports = (function run() {
  // eslint-disable-next-line no-console
  const observer = new PerformanceObserver((items) => console.log(items.getEntries().map((entry) => transformObserverEntry(entry))));
  observer.observe({ entryTypes: ['measure'] });

  performance.mark('iterations');
  for (let i = 0; i < COUNT; i++) {
    buildMongooseModels(modelToMock);
  }

  performance.mark('endIterations');
  performance.measure('Total', 'iterations', 'endIterations');
}());
