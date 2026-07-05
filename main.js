// main.js - Typing Game Implementation

const DEFAULT_WORD_LIST = {
    name: 'Default (a-z)',
    words: Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i))
};

const state = {
    currentScene: 'intro',
    playerName: '',
    difficulty: 'normal',
    wordList: null,
    score: 0
};

function getWordLists() {
    const list = [DEFAULT_WORD_LIST];
    try {
        const stored = localStorage.getItem('words_list');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                list.push(...parsed);
            }
        }
    } catch (e) {
        console.error('Failed to parse words_list from localStorage', e);
    }
    return list;
}

function populateWordLists() {
    if (typeof document === 'undefined') return;
    const select = document.getElementById('wordListSelect');
    if (!select) return;

    select.innerHTML = '';
    const lists = getWordLists();
    lists.forEach((list, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = list.name;
        select.appendChild(option);
    });
}

function saveScore(name, score) {
    let ranking = [];
    try {
        const stored = localStorage.getItem('ranking');
        if (stored) {
            ranking = JSON.parse(stored);
            if (!Array.isArray(ranking)) ranking = [];
        }
    } catch (e) {
        // Ignore JSON parse errors
    }
    ranking.push({ name, score });
    ranking.sort((a, b) => b.score - a.score);
    ranking = ranking.slice(0, 10);
    localStorage.setItem('ranking', JSON.stringify(ranking));
}

function switchScene(sceneName) {
    state.currentScene = sceneName;
    
    if (typeof document !== 'undefined') {
        const scenes = ['intro', 'config', 'game', 'rank'];
        scenes.forEach(name => {
            const el = document.getElementById(`scene-${name}`);
            if (el) {
                if (name === sceneName) {
                    el.classList.add('active');
                } else {
                    el.classList.remove('active');
                }
            }
        });
    }
}

function triggerGameOver() {
    const randomScore = Math.floor(Math.random() * 151);
    state.score = randomScore;
    saveScore(state.playerName, randomScore);
    
    if (typeof document !== 'undefined') {
        const gameStatus = document.getElementById('gameStatus');
        if (gameStatus) {
            gameStatus.textContent = `遊戲結束！玩家：${state.playerName}，得分：${randomScore}`;
        }
    }
}

function handleNameInput(nameInput, startBtn) {
    const val = nameInput.value.trim();
    startBtn.disabled = val.length === 0 || val.length > 10;
}

function init() {
    if (typeof document === 'undefined') return;

    populateWordLists();

    const nameInput = document.getElementById('playerName');
    const startBtn = document.getElementById('startGameBtn');
    if (nameInput && startBtn) {
        nameInput.addEventListener('input', () => handleNameInput(nameInput, startBtn));
        // Run once on load to ensure state sync
        handleNameInput(nameInput, startBtn);
    }

    // Intro Buttons
    startBtn?.addEventListener('click', () => {
        const name = nameInput.value.trim();
        const difficulty = document.getElementById('difficultySelect').value;
        const selectedIdx = document.getElementById('wordListSelect').value;
        const lists = getWordLists();

        state.playerName = name;
        state.difficulty = difficulty;
        state.wordList = lists[selectedIdx] || DEFAULT_WORD_LIST;

        switchScene('game');
        triggerGameOver();
    });

    document.getElementById('showRankBtn')?.addEventListener('click', () => {
        switchScene('rank');
    });

    document.getElementById('showConfigBtn')?.addEventListener('click', () => {
        switchScene('config');
    });

    // Config Buttons
    document.getElementById('backFromConfigBtn')?.addEventListener('click', () => {
        switchScene('intro');
    });

    // Game Buttons
    document.getElementById('restartGameBtn')?.addEventListener('click', () => {
        switchScene('game');
        triggerGameOver();
    });

    document.getElementById('backFromGameBtn')?.addEventListener('click', () => {
        switchScene('intro');
    });

    // Rank Buttons
    document.getElementById('backFromRankBtn')?.addEventListener('click', () => {
        switchScene('intro');
    });
}

if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', init);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DEFAULT_WORD_LIST,
        state,
        getWordLists,
        saveScore,
        switchScene,
        triggerGameOver,
        handleNameInput,
        init
    };
}
