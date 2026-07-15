const { describe, it, assertEqual, assert, getSummary, runPendingTests } = require('./test_lib.js');
const { 
    DEFAULT_WORD_LIST, 
    PREDEFINED_WORD_LIST_FILES,
    state, 
    setPredefinedWordLists,
    loadPredefinedWordLists,
    getWordLists, 
    setActiveButtonGroup,
    refreshGameInterval,
    focusGameInput,
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
    stopGameImmediately,
    addEliminationAnimation,
    pruneEliminationAnimations,
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
        setPredefinedWordLists([]);
        assertEqual(DEFAULT_WORD_LIST.name, 'Default (a-z)');
        assertEqual(DEFAULT_WORD_LIST.words.length, 26);
        assertEqual(DEFAULT_WORD_LIST.words[0], 'a');
        assertEqual(DEFAULT_WORD_LIST.words[25], 'z');
    });

    it('should load default list initially', () => {
        localStorage.clear();
        setPredefinedWordLists([]);
        const lists = getWordLists();
        assertEqual(lists.length, 1);
        assertEqual(lists[0].name, 'Default (a-z)');
    });

    it('should put custom lists from localStorage before defaults', () => {
        localStorage.clear();
        setPredefinedWordLists([]);
        const customList = { name: 'My List', words: ['hello', 'world'] };
        localStorage.setItem('words_list', JSON.stringify([customList]));

        const lists = getWordLists();
        assertEqual(lists.length, 2);
        assertEqual(lists[0].name, 'My List');
        assertEqual(lists[0].words[0], 'hello');
        assertEqual(lists[1].name, 'Default (a-z)');
    });

    it('should include predefined word lists before the default list', () => {
        localStorage.clear();
        setPredefinedWordLists([{ name: 'Built In', words: ['red', 'blue'] }]);

        const lists = getWordLists();
        assertEqual(PREDEFINED_WORD_LIST_FILES[0], 'list01.txt');
        assertEqual(lists.length, 2);
        assertEqual(lists[0].name, 'Built In');
        assertEqual(lists[1].name, 'Default (a-z)');
        setPredefinedWordLists([]);
    });

    it('should keep uploaded lists at the beginning of selection', () => {
        localStorage.clear();
        setPredefinedWordLists([{ name: 'Built In', words: ['red'] }]);
        localStorage.setItem('words_list', JSON.stringify([
            { name: 'Uploaded', words: ['one'] }
        ]));

        const lists = getWordLists();
        assertEqual(lists[0].name, 'Uploaded');
        assertEqual(lists[1].name, 'Built In');
        assertEqual(lists[2].name, 'Default (a-z)');
        setPredefinedWordLists([]);
    });

    it('should load existing predefined files through the configured filenames', async () => {
        localStorage.clear();
        setPredefinedWordLists([]);
        const files = {
            'list01.txt': 'Colors\nred\nblue\n',
            'list02.txt': null
        };

        const loaded = await loadPredefinedWordLists(file => files[file]);
        localStorage.clear();
        const lists = getWordLists();

        assertEqual(loaded.length, 1);
        assertEqual(lists[0].name, 'Colors');
        assertEqual(lists[0].words[1], 'blue');
        assertEqual(lists[1].name, 'Default (a-z)');
        setPredefinedWordLists([]);
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
        const dummyBtn = {
            disabled: false,
            classList: {
                classes: new Set(),
                toggle(name, shouldAdd) {
                    if (shouldAdd) {
                        this.classes.add(name);
                    } else {
                        this.classes.delete(name);
                    }
                },
                contains(name) {
                    return this.classes.has(name);
                }
            }
        };
        
        handleNameInput(dummyInput, dummyBtn);
        assertEqual(dummyBtn.disabled, true);
        assertEqual(dummyBtn.classList.contains('is-disabled'), true);

        dummyInput.value = '   '; // spaces only
        handleNameInput(dummyInput, dummyBtn);
        assertEqual(dummyBtn.disabled, true);
        assertEqual(dummyBtn.classList.contains('is-disabled'), true);

        dummyInput.value = 'Alice';
        handleNameInput(dummyInput, dummyBtn);
        assertEqual(dummyBtn.disabled, false);
        assertEqual(dummyBtn.classList.contains('is-disabled'), false);

        dummyInput.value = 'abcdefghijk'; // 11 characters
        handleNameInput(dummyInput, dummyBtn);
        assertEqual(dummyBtn.disabled, true);
        assertEqual(dummyBtn.classList.contains('is-disabled'), true);
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

    it('should stop the game immediately without changing scene', () => {
        const originalClearInterval = global.clearInterval;
        const originalDocument = global.document;
        try {
            localStorage.clear();
            let statusText = '';
            state.currentScene = 'game';
            state.isGameOver = false;
            state.score = 42;
            state.playerName = 'Stopper';
            state.gameIntervalId = { id: 7 };

            global.clearInterval = id => {
                assertEqual(id.id, 7);
            };
            global.document = {
                getElementById(id) {
                    if (id === 'gameStatus') {
                        return {
                            set textContent(value) {
                                statusText = value;
                            }
                        };
                    }
                    return null;
                }
            };

            stopGameImmediately();

            assertEqual(state.isGameOver, true);
            assertEqual(state.gameIntervalId, null);
            const rankData = JSON.parse(localStorage.getItem('ranking'));
            assertEqual(rankData.length, 1);
            assertEqual(rankData[0].name, 'Stopper');
            assertEqual(rankData[0].score, 42);
            assertEqual(statusText, '遊戲結束！得分：42');
        } finally {
            global.clearInterval = originalClearInterval;
            global.document = originalDocument;
        }
    });
});

describe('Difficulty Button State', () => {
    it('should toggle active state on the selected difficulty button', () => {
        const buttons = [
            {
                dataset: { difficulty: 'easy' },
                classList: {
                    classes: new Set(),
                    toggle(name, shouldAdd) {
                        if (shouldAdd) this.classes.add(name);
                        else this.classes.delete(name);
                    },
                    contains(name) {
                        return this.classes.has(name);
                    }
                },
                setAttribute(name, value) {
                    this[name] = value;
                }
            },
            {
                dataset: { difficulty: 'normal' },
                classList: {
                    classes: new Set(),
                    toggle(name, shouldAdd) {
                        if (shouldAdd) this.classes.add(name);
                        else this.classes.delete(name);
                    },
                    contains(name) {
                        return this.classes.has(name);
                    }
                },
                setAttribute(name, value) {
                    this[name] = value;
                }
            }
        ];

        setActiveButtonGroup(buttons, 'normal');

        assertEqual(buttons[0].classList.contains('active'), false);
        assertEqual(buttons[1].classList.contains('active'), true);
        assertEqual(buttons[0]['aria-pressed'], 'false');
        assertEqual(buttons[1]['aria-pressed'], 'true');
    });

    it('should refresh the running game interval when difficulty changes', () => {
        const originalSetInterval = global.setInterval;
        const originalClearInterval = global.clearInterval;
        const calls = [];
        try {
            global.setInterval = (fn, delay) => {
                calls.push(['set', delay]);
                return { delay };
            };
            global.clearInterval = id => {
                calls.push(['clear', id.delay]);
            };

            state.currentScene = 'game';
            state.isGameOver = false;
            state.difficulty = 'hard';
            state.gameIntervalId = { delay: 800 };

            refreshGameInterval();

            assertEqual(calls[0][0], 'clear');
            assertEqual(calls[0][1], 800);
            assertEqual(calls[1][0], 'set');
            assertEqual(calls[1][1], 500);
        } finally {
            global.setInterval = originalSetInterval;
            global.clearInterval = originalClearInterval;
        }
    });

    it('should focus the game input when difficulty changes', () => {
        const originalDocument = global.document;
        const focusCalls = [];
        try {
            global.document = {
                getElementById(id) {
                    if (id === 'gameTextInput') {
                        return {
                            focus() {
                                focusCalls.push('focused');
                            }
                        };
                    }
                    return null;
                }
            };

            focusGameInput();
            assertEqual(focusCalls.length, 1);
            assertEqual(focusCalls[0], 'focused');
        } finally {
            global.document = originalDocument;
        }
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
        setPredefinedWordLists([]);
        addWordList("Custom1", ["one", "two"]);
        
        const lists = getWordLists();
        assertEqual(lists.length, 2); // default + Custom1
        assertEqual(lists[0].name, "Custom1");
        assertEqual(lists[0].words[1], "two");
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

    it('should match when input contains a falling block word', () => {
        state.board = initBoard();
        state.difficulty = 'easy';
        state.score = 0;
        state.isGameOver = false;
        state.eliminatingBlocks = [];
        state.fallingBlocks = [
            { word: 'cat', x: 2, y: 4, width: 3 }
        ];

        const matched = matchTyping('my cat typed');

        assert(matched);
        assertEqual(state.fallingBlocks.length, 0);
        assertEqual(state.eliminatingBlocks.length, 1);
        assertEqual(state.eliminatingBlocks[0].word, 'cat');
        assertEqual(state.score, 3);
    });

    it('should check falling blocks from lowest to highest and clear the first contained match', () => {
        state.board = initBoard();
        state.difficulty = 'normal';
        state.score = 0;
        state.isGameOver = false;
        state.eliminatingBlocks = [];
        state.fallingBlocks = [
            { word: 'top', x: 2, y: 2, width: 3 },
            { word: 'lowest-miss', x: 2, y: 12, width: 4 },
            { word: 'middle', x: 2, y: 8, width: 4 }
        ];

        const matched = matchTyping('prefix middle and top suffix');

        assert(matched);
        assertEqual(state.fallingBlocks.length, 2);
        assertEqual(state.fallingBlocks[0].word, 'top');
        assertEqual(state.fallingBlocks[1].word, 'lowest-miss');
        assertEqual(state.score, 20);
    });

    it('should prune finished elimination animations', () => {
        state.eliminatingBlocks = [];
        addEliminationAnimation({ word: 'done', x: 1, y: 2, width: 4 }, 1000);

        pruneEliminationAnimations(1259);
        assertEqual(state.eliminatingBlocks.length, 1);

        pruneEliminationAnimations(1260);
        assertEqual(state.eliminatingBlocks.length, 0);
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
        assertEqual(state.board[19][5], ' ');

        state.fallingBlocks = [
            { word: 'b', x: 5, y: 17, width: 1 }
        ];
        moveBlocksDown();
        assertEqual(state.fallingBlocks[0].y, 18);
        
        moveBlocksDown();
        assertEqual(state.fallingBlocks.length, 0);
        assertEqual(state.board[18][5], ' ');
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
        assertEqual(state.board[0][5], ' ');
    });
});

// Final report and exit code
runPendingTests().then(() => {
    const summary = getSummary();
    console.log(`\nTest results: ${summary.passes} passed, ${summary.failures} failed.`);
    if (summary.failures > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
});
