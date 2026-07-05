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

function clearRanking() {
    localStorage.removeItem('ranking');
    updateRankingUI();
}

function updateRankingUI() {
    if (typeof document === 'undefined') return;
    const leaderboardList = document.getElementById('leaderboardList');
    if (!leaderboardList) return;

    leaderboardList.innerHTML = '';
    let ranking = [];
    try {
        const stored = localStorage.getItem('ranking');
        if (stored) {
            ranking = JSON.parse(stored);
        }
    } catch (e) {}

    if (!Array.isArray(ranking) || ranking.length === 0) {
        leaderboardList.innerHTML = '<p>暫無記錄</p>';
        return;
    }

    ranking.forEach((entry, idx) => {
        const div = document.createElement('div');
        div.className = 'rank-entry';
        div.innerHTML = `
            <span class="rank-position">#${idx + 1}</span>
            <span class="rank-name">${escapeHtml(entry.name)}</span>
            <span class="rank-score">${entry.score}</span>
        `;
        leaderboardList.appendChild(div);
    });
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}

function parseWordList(text) {
    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length < 1) {
        throw new Error('Word list file is empty');
    }
    const name = lines[0];
    const words = lines.slice(1);
    if (words.length === 0) {
        throw new Error('Word list contains no words');
    }
    return { name, words };
}

function addWordList(name, words) {
    let list = [];
    try {
        const stored = localStorage.getItem('words_list');
        if (stored) {
            list = JSON.parse(stored);
            if (!Array.isArray(list)) list = [];
        }
    } catch (e) {}

    list.push({ name, words });
    localStorage.setItem('words_list', JSON.stringify(list));
    
    populateWordLists();
    renderCustomWordLists();
}

function deleteWordList(index) {
    let list = [];
    try {
        const stored = localStorage.getItem('words_list');
        if (stored) {
            list = JSON.parse(stored);
            if (!Array.isArray(list)) list = [];
        }
    } catch (e) {}

    if (index >= 0 && index < list.length) {
        list.splice(index, 1);
    }
    localStorage.setItem('words_list', JSON.stringify(list));

    populateWordLists();
    renderCustomWordLists();
}

function renderCustomWordLists() {
    if (typeof document === 'undefined') return;
    const container = document.getElementById('customWordListsList');
    if (!container) return;

    container.innerHTML = '';
    let list = [];
    try {
        const stored = localStorage.getItem('words_list');
        if (stored) {
            list = JSON.parse(stored);
        }
    } catch (e) {}

    if (!Array.isArray(list) || list.length === 0) {
        container.innerHTML = '<p style="color: #bdc3c7; font-size: 14px; margin: 0;">暫無自訂清單</p>';
        return;
    }

    list.forEach((item, idx) => {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.style.padding = '5px 0';
        div.style.borderBottom = '1px solid #4f5d73';

        const nameSpan = document.createElement('span');
        nameSpan.textContent = item.name;
        nameSpan.style.color = '#ecf0f1';
        nameSpan.style.fontSize = '14px';

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '刪除';
        deleteBtn.style.padding = '2px 8px';
        deleteBtn.style.fontSize = '12px';
        deleteBtn.style.backgroundColor = '#e74c3c';
        deleteBtn.style.margin = '0';
        deleteBtn.addEventListener('click', () => {
            deleteWordList(idx);
        });

        div.appendChild(nameSpan);
        div.appendChild(deleteBtn);
        container.appendChild(div);
    });
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

        if (sceneName === 'rank') {
            updateRankingUI();
        } else if (sceneName === 'config') {
            renderCustomWordLists();
        } else if (sceneName === 'intro') {
            populateWordLists();
        }
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
    const uploadWordsBtn = document.getElementById('uploadWordsBtn');
    const wordListFileInput = document.getElementById('wordListFileInput');
    if (uploadWordsBtn && wordListFileInput) {
        uploadWordsBtn.addEventListener('click', () => {
            wordListFileInput.click();
        });
        wordListFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const { name, words } = parseWordList(event.target.result);
                    addWordList(name, words);
                    wordListFileInput.value = '';
                } catch (err) {
                    if (typeof alert !== 'undefined') {
                        alert('上傳失敗：' + err.message);
                    } else {
                        console.error('Upload failed:', err.message);
                    }
                }
            };
            reader.readAsText(file);
        });
    }

    document.getElementById('clearRankConfigBtn')?.addEventListener('click', () => {
        if (typeof confirm === 'undefined' || confirm('確定要清空排行榜嗎？')) {
            clearRanking();
        }
    });

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
    document.getElementById('clearRankBtn')?.addEventListener('click', () => {
        if (typeof confirm === 'undefined' || confirm('確定要清空排行榜嗎？')) {
            clearRanking();
        }
    });

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
        clearRanking,
        updateRankingUI,
        parseWordList,
        addWordList,
        deleteWordList,
        renderCustomWordLists,
        init
    };
}
