const { describe, it, assertEqual, getSummary } = require('./test_lib.js');
const { getAppName } = require('./main.js');

describe('Basic Infrastructure', () => {
    it('should return correct application name', () => {
        assertEqual(getAppName(), 'Typing Game');
    });
});

// Final report and exit code
const summary = getSummary();
console.log(`\nTest results: ${summary.passes} passed, ${summary.failures} failed.`);
if (summary.failures > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
