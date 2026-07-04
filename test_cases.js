const { describe, it, assertEqual, getSummary } = require('./test_lib.js');
const { state, switchScene } = require('./main.js');

describe('Basic Infrastructure', () => {
    it('should initialize with correct default state', () => {
        assertEqual(state.currentScene, 'intro');
        assertEqual(state.score, 0);
    });
});

describe('Scene Flow transitions', () => {
    it('should transition to game scene', () => {
        switchScene('game');
        assertEqual(state.currentScene, 'game');
    });

    it('should transition to rank scene', () => {
        switchScene('rank');
        assertEqual(state.currentScene, 'rank');
    });

    it('should transition to config scene', () => {
        switchScene('config');
        assertEqual(state.currentScene, 'config');
    });

    it('should transition back to intro scene', () => {
        switchScene('intro');
        assertEqual(state.currentScene, 'intro');
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
