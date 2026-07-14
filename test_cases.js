const { describe, it, assertEqual, assert, getSummary } = require('./test_lib.js');
const { 
    DEFAULT_WORD_LIST, 
    state, 
    getWordLists, 
    saveScore, 
    switchScene, 
    triggerGameOver, 
    handleNameInput,
    clearRanking,
    parseWordList,
    addWordList,
    deleteWordList,
    getDifficultyConfig,
    initBoard,
    isBoardEmpty,
    checkBlockOverlap,
    spawnBlock,
    moveBlocksDown,
    gameTick,
    startGame,
    endGame,
    matchTyping
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

describe('Config and Word List Upload/Management', () => {
    it('should clear ranking successfully', () => {
        localStorage.clear();
        saveScore('Test', 100);
        assertEqual(JSON.parse(localStorage.getItem('ranking')).length, 1);
        
        clearRanking();
        assertEqual(localStorage.getItem('ranking'), null);
    });

    it('should parse valid word list files', () => {
        const fileContent = "Colors\nred\nblue\ngreen\n";
        const parsed = parseWordList(fileContent);
        assertEqual(parsed.name, "Colors");
        assertEqual(parsed.words.length, 3);
        assertEqual(parsed.words[0], "red");
        assertEqual(parsed.words[2], "green");
    });

    it('should throw error on invalid/empty file format', () => {
        const { assertThrows } = require('./test_lib.js');
        assertThrows(() => parseWordList(""));
        assertThrows(() => parseWordList("NameOnly"));
    });

    it('should add new word lists to localStorage', () => {
        localStorage.clear();
        addWordList("Custom1", ["one", "two"]);
        
        const lists = getWordLists();
        assertEqual(lists.length, 2); // default + Custom1
        assertEqual(lists[1].name, "Custom1");
        assertEqual(lists[1].words[1], "two");
    });

    it('should delete existing word lists', () => {
        localStorage.clear();
        addWordList("List A", ["a"]);
        addWordList("List B", ["b"]);
        
        let customLists = JSON.parse(localStorage.getItem('words_list'));
        assertEqual(customLists.length, 2);
        
        deleteWordList(0); // Deletes List A
        
        customLists = JSON.parse(localStorage.getItem('words_list'));
        assertEqual(customLists.length, 1);
        assertEqual(customLists[0].name, "List B");
    });
});

describe('Phase 5 Game Mechanics', () => {
    it('should configure correct interval and score multiplier based on difficulty', () => {
        const easy = getDifficultyConfig('easy');
        assertEqual(easy.interval, 1000);
        assertEqual(easy.multiplier, 1);

        const normal = getDifficultyConfig('normal');
        assertEqual(normal.interval, 800);
        assertEqual(normal.multiplier, 5);

        const hard = getDifficultyConfig('hard');
        assertEqual(hard.interval, 500);
        assertEqual(hard.multiplier, 10);
    });

    it('should initialize empty board correctly', () => {
        const board = initBoard();
        assertEqual(board.length, 20);
        assertEqual(board[0].length, 20);
        assert(isBoardEmpty(board));
    });

    it('should spawn blocks with width matching word length (max 4)', () => {
        state.board = initBoard();
        state.fallingBlocks = [];
        state.wordList = { name: 'Test', words: ['testword'] }; // length 8
        spawnBlock();
        assertEqual(state.fallingBlocks.length, 1);
        const block = state.fallingBlocks[0];
        assertEqual(block.word, 'testword');
        assertEqual(block.width, 4); // capped at 4
        assert(block.x >= 0 && block.x <= 16);
    });

    it('should prioritize matching the lowest block when duplicate words exist', () => {
        state.board = initBoard();
        state.difficulty = 'normal';
        state.score = 0;
        state.isGameOver = false;
        state.fallingBlocks = [
            { word: 'abc', x: 2, y: 2, width: 3 },
            { word: 'abc', x: 5, y: 5, width: 3 }
        ];
        const matched = matchTyping('abc');
        assert(matched);
        assertEqual(state.fallingBlocks.length, 1);
        assertEqual(state.fallingBlocks[0].y, 2);
        assertEqual(state.score, 15);
    });

    it('should move falling blocks down and land them at bottom or on other blocks', () => {
        state.board = initBoard();
        state.fallingBlocks = [
            { word: 'a', x: 5, y: 18, width: 1 }
        ];
        
        moveBlocksDown();
        assertEqual(state.fallingBlocks.length, 1);
        assertEqual(state.fallingBlocks[0].y, 19);

        moveBlocksDown();
        assertEqual(state.fallingBlocks.length, 0);
        assertEqual(state.board[19][5], 'a');

        state.fallingBlocks = [
            { word: 'b', x: 5, y: 17, width: 1 }
        ];
        moveBlocksDown();
        assertEqual(state.fallingBlocks[0].y, 18);
        
        moveBlocksDown();
        assertEqual(state.fallingBlocks.length, 0);
        assertEqual(state.board[18][5], 'b');
    });

    it('should trigger game over when a block lands at the top (y <= 0)', () => {
        state.board = initBoard();
        state.isGameOver = false;
        state.fallingBlocks = [
            { word: 'a', x: 5, y: 0, width: 1 }
        ];
        state.board[1][5] = 'x';

        moveBlocksDown();
        assert(state.isGameOver);
        assertEqual(state.board[0][5], 'a');
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
