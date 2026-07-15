// main.js - Typing Game Implementation

const DEFAULT_WORD_LIST = {
    name: 'Default (a-z)',
    words: Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i))
};

const GAME_BOARD_WIDTH = 20;
const GAME_BOARD_HEIGHT = 20;
globalThis.GAME_BOARD_WIDTH = GAME_BOARD_WIDTH;
globalThis.GAME_BOARD_HEIGHT = GAME_BOARD_HEIGHT;
const GAME_CANVAS_SIZE = 600;
const PREDEFINED_WORD_LIST_FILES = ['list01.txt', 'list02.txt'];
const ELIMINATION_ANIMATION_MS = 260;

let predefinedWordLists = [];

const state = {
    currentScene: 'intro',
    playerName: '',
    difficulty: 'normal',
    wordList: null,
    score: 0,
    board: null,
    fallingBlocks: [],
    eliminatingBlocks: [],
    animationFrameId: null,
    gameIntervalId: null,
    tickCount: 0,
    isGameOver: false
};

function getStoredWordLists() {
    try {
        const stored = localStorage.getItem('words_list');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        }
    } catch (e) {
        console.error('Failed to parse words_list from localStorage', e);
    }
    return [];
}

function getWordLists() {
    return [
        ...getStoredWordLists(),
        ...predefinedWordLists,
        DEFAULT_WORD_LIST
    ];
}

function setPredefinedWordLists(lists) {
    predefinedWordLists = Array.isArray(lists) ? lists : [];
}

async function loadTextFile(path) {
    if (typeof fetch === 'undefined') return null;
    try {
        const response = await fetch(path, { cache: 'no-store' });
        if (!response.ok) return null;
        return await response.text();
    } catch (e) {
        return null;
    }
}

async function loadPredefinedWordLists(loader = loadTextFile) {
    const loaded = [];
    for (const file of PREDEFINED_WORD_LIST_FILES) {
        const text = await loader(file);
        if (text) {
            try {
                loaded.push(parseWordList(text));
            } catch (e) {
                console.error(`Failed to parse predefined word list ${file}`, e);
            }
        }
    }
    setPredefinedWordLists(loaded);
    return loaded;
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

function setActiveButtonGroup(buttons, activeValue) {
    buttons.forEach(button => {
        const buttonValue = button.dataset.difficulty || button.dataset.value;
        const isActive = buttonValue === activeValue;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
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
    if (sceneName !== 'game' && state.gameIntervalId) {
        clearInterval(state.gameIntervalId);
        state.gameIntervalId = null;
    }
    
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
    updateGameSummary(`遊戲結束！玩家：${state.playerName}`, randomScore);
}

function handleNameInput(nameInput, startBtn) {
    const val = nameInput.value.trim();
    const isDisabled = val.length === 0 || val.length > 10;
    startBtn.disabled = isDisabled;
    startBtn.classList?.toggle('is-disabled', isDisabled);
}

function getDifficultyConfig(diff) {
    if (diff === 'easy') return { interval: 1000, multiplier: 1 };
    if (diff === 'hard') return { interval: 500, multiplier: 10 };
    return { interval: 800, multiplier: 5 };
}

function buildGameSummaryText(statusText, score) {
    return `狀態：${statusText} | 得分：${score}`;
}

function getBlockTextFont(weight = 'normal') {
    return `${weight} 14px Georgia, "Times New Roman", serif`;
}

function drawWordText(ctx, word, centerX, centerY, spacing = 1) {
    const chars = [...word];
    const measureChar = typeof ctx.measureText === 'function'
        ? char => ctx.measureText(char).width
        : () => 8;
    const charWidths = chars.map(char => measureChar(char));
    const totalWidth = charWidths.reduce((sum, width) => sum + width, 0) + Math.max(0, chars.length - 1) * spacing;
    let cursorX = centerX - totalWidth / 2;
    chars.forEach((char, index) => {
        const width = charWidths[index];
        ctx.fillText(char, cursorX + width / 2, centerY);
        cursorX += width + spacing;
    });
}

function updateGameSummary(statusText, score) {
    if (typeof document === 'undefined') return;
    const summaryEl = document.getElementById('gameSummary');
    if (!summaryEl) return;
    summaryEl.innerHTML = `
        <span class="summary-status">${escapeHtml(statusText)}</span>
        <span class="summary-divider">|</span>
        <span class="summary-score">得分: ${score}</span>
    `;
}

function refreshGameInterval() {
    if (typeof setInterval === 'undefined' || typeof clearInterval === 'undefined') return;
    if (state.currentScene !== 'game' || state.isGameOver) return;

    if (state.gameIntervalId) {
        clearInterval(state.gameIntervalId);
    }
    const diffConfig = getDifficultyConfig(state.difficulty);
    state.gameIntervalId = setInterval(gameTick, diffConfig.interval);
}

function focusGameInput() {
    if (typeof document === 'undefined') return;
    document.getElementById('gameTextInput')?.focus();
}

function initBoard() {
    const board = [];
    for (let r = 0; r < GAME_BOARD_HEIGHT; r++) {
        board.push(new Array(GAME_BOARD_WIDTH).fill(null));
    }
    return board;
}

function isBoardEmpty(board) {
    return board.every(row => row.every(cell => cell === null));
}

function checkBlockOverlap(block, yOffset, board) {
    const checkY = block.y + yOffset;
    if (checkY >= GAME_BOARD_HEIGHT) return true;
    for (let i = 0; i < block.width; i++) {
        const checkX = block.x + i;
        if (checkX < 0 || checkX >= GAME_BOARD_WIDTH) return true;
        if (board[checkY][checkX] !== null) return true;
    }
    return false;
}

function spawnBlock() {
    const wordList = state.wordList ? state.wordList.words : DEFAULT_WORD_LIST.words;
    const activeWords = new Set(state.fallingBlocks.map(b => b.word));
    let available = wordList.filter(w => !activeWords.has(w));
    if (available.length === 0) available = wordList;
    const word = available[Math.floor(Math.random() * available.length)];
    const width = Math.max(1, Math.min(word.length, 4));
    const x = Math.floor(Math.random() * (GAME_BOARD_WIDTH - width + 1));
    const block = { word, x, y: 0, width };
    if (checkBlockOverlap(block, 0, state.board)) {
        state.isGameOver = true;
    } else {
        state.fallingBlocks.push(block);
    }
}

function moveBlocksDown() {
    state.fallingBlocks.sort((a, b) => b.y - a.y);
    const toRemove = [];
    for (const block of state.fallingBlocks) {
        if (checkBlockOverlap(block, 1, state.board)) {
            for (let i = 0; i < block.width; i++) {
                state.board[block.y][block.x + i] = block;
            }
            toRemove.push(block);
            if (block.y <= 0) state.isGameOver = true;
        } else {
            block.y++;
        }
    }
    state.fallingBlocks = state.fallingBlocks.filter(b => !toRemove.includes(b));
}

function gameTick() {
    if (state.isGameOver) return;
    state.tickCount++;
    moveBlocksDown();
    if (state.isGameOver) {
        endGame();
        return;
    }
    const empty = state.fallingBlocks.length === 0 && isBoardEmpty(state.board);
    if (empty) {
        spawnBlock();
    } else if (state.tickCount % 3 === 0) {
        spawnBlock();
    }
    if (state.isGameOver) {
        endGame();
        return;
    }
    drawGame();
}

function startGame() {
    if (state.gameIntervalId) clearInterval(state.gameIntervalId);
    state.score = 0;
    state.board = initBoard();
    state.fallingBlocks = [];
    state.eliminatingBlocks = [];
    state.animationFrameId = null;
    state.tickCount = 0;
    state.isGameOver = false;
    const diffConfig = getDifficultyConfig(state.difficulty);
    if (typeof document !== 'undefined') {
        updateGameSummary('遊戲進行中...', 0);
        const inputEl = document.getElementById('gameTextInput');
        if (inputEl) {
            inputEl.value = '';
            inputEl.focus();
        }
    }
    spawnBlock();
    drawGame();
    state.gameIntervalId = setInterval(gameTick, diffConfig.interval);
}

function endGame() {
    if (state.gameIntervalId) {
        clearInterval(state.gameIntervalId);
        state.gameIntervalId = null;
    }
    state.isGameOver = true;
    saveScore(state.playerName, state.score);
    updateGameSummary('遊戲結束！', state.score);
    drawGame();
}

function stopGameImmediately() {
    if (state.currentScene !== 'game' || state.isGameOver) return;
    endGame();
}

function getEliminationProgress(animation, now) {
    return Math.min((now - animation.startedAt) / animation.duration, 1);
}

function addEliminationAnimation(block, now = Date.now()) {
    state.eliminatingBlocks.push({
        word: block.word,
        x: block.x,
        y: block.y,
        width: block.width,
        startedAt: now,
        duration: ELIMINATION_ANIMATION_MS
    });
}

function pruneEliminationAnimations(now = Date.now()) {
    state.eliminatingBlocks = state.eliminatingBlocks.filter(animation => {
        return getEliminationProgress(animation, now) < 1;
    });
}

function requestEliminationRedraw() {
    if (typeof requestAnimationFrame === 'undefined') return;
    if (state.animationFrameId !== null) return;
    state.animationFrameId = requestAnimationFrame(() => {
        state.animationFrameId = null;
        drawGame();
    });
}

function drawGame() {
    if (typeof document === 'undefined') return;
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const cw = canvas.width, ch = canvas.height;
    const cellW = cw / GAME_BOARD_WIDTH, cellH = ch / GAME_BOARD_HEIGHT;
    ctx.clearRect(0, 0, cw, ch);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GAME_BOARD_WIDTH; i++) {
        ctx.beginPath(); ctx.moveTo(i * cellW, 0); ctx.lineTo(i * cellW, ch); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * cellH); ctx.lineTo(cw, i * cellH); ctx.stroke();
    }
    ctx.fillStyle = '#7f8c8d';
    for (let r = 0; r < GAME_BOARD_HEIGHT; r++) {
        for (let c = 0; c < GAME_BOARD_WIDTH; c++) {
            const block = state.board[r][c];
            if (block === null) continue;
            if (c > 0 && state.board[r][c - 1] === block) continue;
            ctx.fillRect(c * cellW + 1, r * cellH + 1, block.width * cellW - 2, cellH - 2);
            ctx.fillStyle = '#ffffff';
    ctx.font = getBlockTextFont();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(block.word, c * cellW + (block.width * cellW) / 2, r * cellH + cellH / 2);
            ctx.fillStyle = '#7f8c8d';
        }
    }
    const fallingBlockColor = getFallingBlockColor();
    state.fallingBlocks.forEach(block => drawBlock(ctx, block, cellW, cellH, fallingBlockColor, 1));
    drawEliminatingBlocks(ctx, cellW, cellH);
    pruneEliminationAnimations();
    if (state.eliminatingBlocks.length > 0) requestEliminationRedraw();
}

function getFallingBlockColor() {
    return state.isGameOver ? '#7f8c8d' : '#3498db';
}

function drawBlock(ctx, block, cellW, cellH, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(block.x * cellW + 1, block.y * cellH + 1, block.width * cellW - 2, cellH - 2);
    ctx.fillStyle = '#ffffff';
    ctx.font = getBlockTextFont();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    drawWordText(ctx, block.word, block.x * cellW + (block.width * cellW) / 2, block.y * cellH + cellH / 2);
    ctx.restore();
}

function drawEliminatingBlocks(ctx, cellW, cellH, now = Date.now()) {
    state.eliminatingBlocks.forEach(animation => {
        const progress = getEliminationProgress(animation, now);
        const alpha = 1 - progress;
        const inset = progress * -4;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(
            animation.x * cellW + 1 + inset,
            animation.y * cellH + 1 + inset,
            animation.width * cellW - 2 - inset * 2,
            cellH - 2 - inset * 2
        );
        ctx.fillStyle = '#ffffff';
        ctx.font = getBlockTextFont();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        drawWordText(ctx, animation.word, animation.x * cellW + (animation.width * cellW) / 2, animation.y * cellH + cellH / 2);
        ctx.restore();
    });
}

function findMatchingFallingBlock(inputVal) {
    const blocksFromLowest = [...state.fallingBlocks].sort((a, b) => b.y - a.y);
    return blocksFromLowest.find(block => inputVal.includes(block.word)) || null;
}

function matchTyping(inputVal) {
    if (state.isGameOver) return false;
    const target = findMatchingFallingBlock(inputVal);
    if (!target) return false;
    state.fallingBlocks = state.fallingBlocks.filter(b => b !== target);
    addEliminationAnimation(target);
    const diffConfig = getDifficultyConfig(state.difficulty);
    state.score += diffConfig.multiplier * target.width;
    updateGameSummary('遊戲進行中...', state.score);
    drawGame();
    return true;
}

function loadAndRefreshWordLists() {
    populateWordLists();
    loadPredefinedWordLists().then(() => {
        populateWordLists();
    });
}

function bindIntroControls() {
    const nameInput = document.getElementById('playerName');
    const startBtn = document.getElementById('startGameBtn');
    if (nameInput && startBtn) {
        nameInput.addEventListener('input', () => handleNameInput(nameInput, startBtn));
        handleNameInput(nameInput, startBtn);
    }

    startBtn?.addEventListener('click', () => {
        const name = nameInput.value.trim();
        const selectedIdx = document.getElementById('wordListSelect').value;
        const lists = getWordLists();

        state.playerName = name;
        state.wordList = lists[selectedIdx] || DEFAULT_WORD_LIST;

        switchScene('game');
        startGame();
    });

    document.getElementById('showRankBtn')?.addEventListener('click', () => {
        switchScene('rank');
    });

    document.getElementById('showConfigBtn')?.addEventListener('click', () => {
        switchScene('config');
    });
}

function bindDifficultyControls() {
    if (typeof document === 'undefined') return;
    const buttons = Array.from(document.querySelectorAll('[data-difficulty]'));
    if (buttons.length === 0) return;

    const syncButtons = () => setActiveButtonGroup(buttons, state.difficulty);

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            state.difficulty = button.dataset.difficulty;
            syncButtons();
            refreshGameInterval();
            focusGameInput();
        });
    });

    syncButtons();
}

function showUploadError(err) {
    if (typeof alert !== 'undefined') {
        alert('上傳失敗：' + err.message);
    } else {
        console.error('Upload failed:', err.message);
    }
}

function handleUploadedWordListFile(fileInput, file) {
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const { name, words } = parseWordList(event.target.result);
            addWordList(name, words);
            fileInput.value = '';
        } catch (err) {
            showUploadError(err);
        }
    };
    reader.readAsText(file);
}

function bindConfigControls() {
    const uploadWordsBtn = document.getElementById('uploadWordsBtn');
    const wordListFileInput = document.getElementById('wordListFileInput');
    uploadWordsBtn?.addEventListener('click', () => wordListFileInput?.click());
    wordListFileInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleUploadedWordListFile(wordListFileInput, file);
    });
    document.getElementById('clearRankConfigBtn')?.addEventListener('click', () => {
        if (typeof confirm === 'undefined' || confirm('確定要清空排行榜嗎？')) {
            clearRanking();
        }
    });

    document.getElementById('backFromConfigBtn')?.addEventListener('click', () => {
        switchScene('intro');
    });
}

function bindGameControls() {
    bindDifficultyControls();

    document.getElementById('restartGameBtn')?.addEventListener('click', () => {
        switchScene('game');
        startGame();
    });

    document.getElementById('stopGameBtn')?.addEventListener('click', () => {
        stopGameImmediately();
    });

    document.getElementById('backFromGameBtn')?.addEventListener('click', () => {
        switchScene('intro');
    });

    const gameInput = document.getElementById('gameTextInput');
    gameInput?.addEventListener('input', () => {
        const val = gameInput.value.trim();
        if (matchTyping(val)) {
            gameInput.value = '';
        }
    });
    gameInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            gameInput.value = '';
        }
        if (e.key === 'Enter') {
            gameInput.value = '';
        }
    });
}

function bindRankControls() {
    document.getElementById('clearRankBtn')?.addEventListener('click', () => {
        if (typeof confirm === 'undefined' || confirm('確定要清空排行榜嗎？')) {
            clearRanking();
        }
    });

    document.getElementById('backFromRankBtn')?.addEventListener('click', () => {
        switchScene('intro');
    });
}

function init() {
    if (typeof document === 'undefined') return;

    loadAndRefreshWordLists();
    bindIntroControls();
    bindConfigControls();
    bindGameControls();
    bindRankControls();
}

if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', init);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DEFAULT_WORD_LIST,
        GAME_CANVAS_SIZE,
        PREDEFINED_WORD_LIST_FILES,
        state,
        setPredefinedWordLists,
        loadPredefinedWordLists,
        getWordLists,
        setActiveButtonGroup,
        buildGameSummaryText,
        getBlockTextFont,
        drawWordText,
        drawBlock,
        refreshGameInterval,
        focusGameInput,
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
        init,
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
        getFallingBlockColor,
        addEliminationAnimation,
        pruneEliminationAnimations,
        matchTyping
    };
}
