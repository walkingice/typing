const { describe, it, assertEqual, assert, getSummary } = require('./test_lib.js');
const { 
    DEFAULT_WORD_LIST, 
    state, 
    getWordLists, 
    saveScore, 
    switchScene, 
    triggerGameOver, 
    handleNameInput 
} = require('./main.js');

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

describe('Word Lists', () => {
    it('should have a default word list a-z', () => {
        assertEqual(DEFAULT_WORD_LIST.name, 'Default (a-z)');
        assertEqual(DEFAULT_WORD_LIST.words.length, 26);
        assertEqual(DEFAULT_WORD_LIST.words[0], 'a');
        assertEqual(DEFAULT_WORD_LIST.words[25], 'z');
    });

    it('should load default list initially', () => {
        localStorage.clear();
        const lists = getWordLists();
        assertEqual(lists.length, 1);
        assertEqual(lists[0].name, 'Default (a-z)');
    });

    it('should load custom lists from localStorage', () => {
        localStorage.clear();
        const customList = { name: 'My List', words: ['hello', 'world'] };
        localStorage.setItem('words_list', JSON.stringify([customList]));

        const lists = getWordLists();
        assertEqual(lists.length, 2);
        assertEqual(lists[0].name, 'Default (a-z)');
        assertEqual(lists[1].name, 'My List');
        assertEqual(lists[1].words[0], 'hello');
    });
});

describe('Ranking System', () => {
    it('should save score and retrieve it', () => {
        localStorage.clear();
        saveScore('Alice', 100);
        
        const rankData = JSON.parse(localStorage.getItem('ranking'));
        assertEqual(rankData.length, 1);
        assertEqual(rankData[0].name, 'Alice');
        assertEqual(rankData[0].score, 100);
    });

    it('should sort scores in descending order', () => {
        localStorage.clear();
        saveScore('Bob', 50);
        saveScore('Alice', 100);
        saveScore('Charlie', 75);

        const rankData = JSON.parse(localStorage.getItem('ranking'));
        assertEqual(rankData.length, 3);
        assertEqual(rankData[0].name, 'Alice');
        assertEqual(rankData[0].score, 100);
        assertEqual(rankData[1].name, 'Charlie');
        assertEqual(rankData[1].score, 75);
        assertEqual(rankData[2].name, 'Bob');
        assertEqual(rankData[2].score, 50);
    });

    it('should keep only top 10 scores', () => {
        localStorage.clear();
        for (let i = 1; i <= 12; i++) {
            saveScore(`Player${i}`, i * 10);
        }

        const rankData = JSON.parse(localStorage.getItem('ranking'));
        assertEqual(rankData.length, 10);
        // Player12 should be rank 1 (120 pts), Player3 should be rank 10 (30 pts)
        assertEqual(rankData[0].name, 'Player12');
        assertEqual(rankData[0].score, 120);
        assertEqual(rankData[9].name, 'Player3');
        assertEqual(rankData[9].score, 30);
    });
});

describe('Validation and Game End mock', () => {
    it('should validate name length', () => {
        const dummyInput = { value: '' };
        const dummyBtn = { disabled: false };
        
        handleNameInput(dummyInput, dummyBtn);
        assertEqual(dummyBtn.disabled, true);

        dummyInput.value = '   '; // spaces only
        handleNameInput(dummyInput, dummyBtn);
        assertEqual(dummyBtn.disabled, true);

        dummyInput.value = 'Alice';
        handleNameInput(dummyInput, dummyBtn);
        assertEqual(dummyBtn.disabled, false);

        dummyInput.value = 'abcdefghijk'; // 11 characters
        handleNameInput(dummyInput, dummyBtn);
        assertEqual(dummyBtn.disabled, true);
    });

    it('should trigger game over and record random score', () => {
        localStorage.clear();
        state.playerName = 'TestPlayer';
        triggerGameOver();

        assert(state.score >= 0 && state.score <= 150, 'Score should be between 0 and 150');
        const rankData = JSON.parse(localStorage.getItem('ranking'));
        assertEqual(rankData.length, 1);
        assertEqual(rankData[0].name, 'TestPlayer');
        assertEqual(rankData[0].score, state.score);
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
