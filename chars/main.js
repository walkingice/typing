// main.js - Typing Practice App Shell

const PRACTICE_CHARS_PER_LINE = 20;
const PRACTICE_CHARS_PER_GROUP = 5;

const PRACTICE_TARGETS = [
    {
        id: 'lowercaseTwice',
        label: '字母',
        description: 'Lowercase letters a-z, repeated twice.',
        text: buildRepeatedAlphabet(2)
    },
    {
        id: 'symbolsTwice',
        label: '字母符號',
        description: 'Lowercase letters a-z and common half-width symbols (!),@.-, repeated twice.',
        text: buildAlphabetWithSymbols(2)
    },
    {
        id: 'alphabetSegments',
        label: '字母反覆',
        description: 'Lowercase letters a-z, split into segments of 7 letters. Each segment repeats 3 times before moving to the next.',
        text: buildSegmentedAlphabet()
    }
];

let selectedTargetId = PRACTICE_TARGETS[0].id;
const sessionStateByDocument = new WeakMap();

function getAppName() {
    return 'Typing Practice';
}

function createControlButtons() {
    return [
        { id: 'restartButton', label: '重開' }
    ];
}

function createSessionState(targetId = selectedTargetId) {
    return {
        targetId,
        input: '',
        startedAt: null,
        finishedAt: null,
        isCompleted: false,
        lastElapsedMs: 0,
        timerHandle: null
    };
}

function getSessionState(doc) {
    if (!sessionStateByDocument.has(doc)) {
        sessionStateByDocument.set(doc, createSessionState());
    }

    return sessionStateByDocument.get(doc);
}

function setSessionState(doc, nextState) {
    sessionStateByDocument.set(doc, nextState);
    return nextState;
}

function resetSessionState(doc, targetId = selectedTargetId) {
    if (sessionStateByDocument.has(doc)) {
        clearTimerLoop(sessionStateByDocument.get(doc));
    }
    return setSessionState(doc, createSessionState(targetId));
}

function buildRepeatedAlphabet(repeatCount) {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    return Array.from({ length: repeatCount }, () => letters).join('');
}

function buildAlphabetWithSymbols(repeatCount) {
    const letters = 'abcdefghijklmnopqrstuvwxyz!@.-,';
    return Array.from({ length: repeatCount }, () => letters).join('');
}

function buildSegmentedAlphabet() {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const segments = [];

    for (let index = 0; index < letters.length; index += 7) {
        const segment = letters.slice(index, index + 7);
        segments.push(segment, segment, segment);
    }

    return segments.join('');
}

function formatElapsedTime(ms) {
    return `${(ms / 1000).toFixed(2)}s`;
}

function getHighScoreStorageKey() {
    return 'typingPracticeHighScores';
}

function readHighScoreRecords() {
    if (typeof localStorage === 'undefined') {
        return {};
    }

    try {
        const raw = localStorage.getItem(getHighScoreStorageKey());
        return raw ? JSON.parse(raw) : {};
    } catch (error) {
        return {};
    }
}

function writeHighScoreRecords(records) {
    if (typeof localStorage === 'undefined') {
        return false;
    }

    localStorage.setItem(getHighScoreStorageKey(), JSON.stringify(records));
    return true;
}

function getHighScoreForTarget(targetId) {
    const records = readHighScoreRecords();
    const value = records[targetId];
    return typeof value === 'number' ? value : null;
}

function setHighScoreForTarget(targetId, elapsedMs) {
    const records = readHighScoreRecords();
    records[targetId] = elapsedMs;
    return writeHighScoreRecords(records);
}

function formatHighScoreValue(elapsedMs) {
    return elapsedMs === null ? '--' : formatElapsedTime(elapsedMs);
}

function getPracticeText(targetId = selectedTargetId) {
    return getPracticeTargetById(targetId).text;
}

function getTypedCharacterState(expectedText, typedText) {
    const state = [];
    const length = Math.max(expectedText.length, typedText.length);

    for (let index = 0; index < length; index += 1) {
        const expected = expectedText[index];
        const actual = typedText[index];

        if (actual === undefined) {
            state.push('pending');
        } else if (actual === expected) {
            state.push('correct');
        } else {
            state.push('incorrect');
        }
    }

    return state;
}

function isPracticeGroupEnd(index) {
    return (index + 1) % PRACTICE_CHARS_PER_GROUP === 0;
}

function isPrintableKey(key) {
    return typeof key === 'string' && key.length === 1;
}

function updateTimerDisplay(doc, nowFn = () => Date.now()) {
    const stopwatch = doc.getElementById('stopwatchValue');
    const session = getSessionState(doc);

    if (!stopwatch) {
        return null;
    }

    const elapsedMs = session.startedAt === null
        ? 0
        : (session.finishedAt ?? nowFn()) - session.startedAt;

    session.lastElapsedMs = elapsedMs;
    stopwatch.textContent = formatElapsedTime(elapsedMs);
    return elapsedMs;
}

function updateHighScoreDisplay(doc, targetId = selectedTargetId) {
    const highScoreValue = doc.getElementById('highScoreValue');

    if (!highScoreValue) {
        return null;
    }

    const elapsedMs = getHighScoreForTarget(targetId);
    highScoreValue.textContent = formatHighScoreValue(elapsedMs);
    return elapsedMs;
}

function createStatusLabel(doc, label, value, id) {
    const wrapper = doc.createElement('div');
    wrapper.className = 'status-item';

    const title = doc.createElement('span');
    title.className = 'status-label';
    title.textContent = label;

    const content = doc.createElement('span');
    content.className = 'status-value';
    content.id = id;
    content.textContent = value;

    wrapper.appendChild(title);
    wrapper.appendChild(content);
    return wrapper;
}

function createHighScoreButton(doc, value) {
    const button = doc.createElement('button');
    button.type = 'button';
    button.id = 'highScoreButton';
    button.className = 'status-item status-button';
    button.setAttribute('aria-label', 'High Score');

    const title = doc.createElement('span');
    title.className = 'status-label';
    title.textContent = 'High Score';

    const content = doc.createElement('span');
    content.className = 'status-value';
    content.id = 'highScoreValue';
    content.textContent = value;

    button.appendChild(title);
    button.appendChild(content);
    return button;
}

function getPracticeTargetById(targetId) {
    return PRACTICE_TARGETS.find((target) => target.id === targetId) || PRACTICE_TARGETS[0];
}

function getSelectedPracticeTarget() {
    return getPracticeTargetById(selectedTargetId);
}

function createSection(doc, className, id, text) {
    const section = doc.createElement('section');
    section.className = className;
    section.id = id;

    if (text) {
        const p = doc.createElement('p');
        p.textContent = text;
        section.appendChild(p);
    }

    return section;
}

function createButton(doc, id, label, variant) {
    const button = doc.createElement('button');
    button.type = 'button';
    button.id = id;
    button.textContent = label;
    if (variant) {
        button.className = variant;
    }
    return button;
}

function createKeyboardLayout() {
    return [
        [
            { key: '!' },
            { key: '@' },
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            { key: '-' }
        ],
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'].map((key) => ({ key })),
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'].map((key) => ({ key })),
        ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.'].map((key) => ({ key }))
    ];
}

function createKeyboardKey(doc, definition) {
    if (!definition) {
        const spacer = doc.createElement('div');
        spacer.className = 'keyboard-key-spacer';
        return spacer;
    }

    const key = doc.createElement('div');
    key.className = 'keyboard-key';
    if (['f', 'j'].includes(definition.key)) {
        key.classList.add('is-home-key');
    }
    key.textContent = definition.key;
    key.setAttribute('data-key', definition.key);
    key.setAttribute('aria-label', `Key ${definition.key}`);
    return key;
}

function createTargetButton(doc, target) {
    const button = createButton(doc, `target-${target.id}`, target.label, 'mode-toggle');
    button.setAttribute('data-target-id', target.id);
    button.setAttribute('aria-pressed', String(target.id === selectedTargetId));
    if (target.id === selectedTargetId) {
        button.className = 'mode-toggle is-selected';
    }
    return button;
}

function createKeyboardRow(doc, keys, rowIndex) {
    const row = doc.createElement('div');
    row.className = rowIndex === 0 ? 'keyboard-row keyboard-symbol-row' : 'keyboard-row';

    keys.forEach((keyLabel) => {
        row.appendChild(createKeyboardKey(doc, keyLabel));
    });

    return row;
}

function getNextExpectedCharacter(target, input) {
    return input.length < target.text.length ? target.text[input.length] : null;
}

function updateKeyboardHighlight(doc, target = getSelectedPracticeTarget(), input = '') {
    const keyboardBody = doc.getElementById('keyboardBody');
    if (!keyboardBody || !keyboardBody.children[0]) {
        return false;
    }

    const nextCharacter = getNextExpectedCharacter(target, input);
    const keyboard = keyboardBody.children[0];
    Array.from(keyboard.children).forEach((row) => {
        Array.from(row.children).forEach((key) => {
            const isCurrent = nextCharacter !== null && (
                key.getAttribute('data-key') === nextCharacter
                || key.getAttribute('data-shift-key') === nextCharacter
            );
            key.classList.toggle('is-current', isCurrent);
        });
    });
    return true;
}

function updateKeyboardPressedKey(doc, keyValue, isPressed) {
    const keyboardBody = doc.getElementById('keyboardBody');
    if (!keyboardBody || !keyboardBody.children[0]) {
        return false;
    }

    const keyLabel = isPrintableKey(keyValue) ? keyValue.toLowerCase() : keyValue;
    const keyboard = keyboardBody.children[0];
    Array.from(keyboard.children).forEach((row) => {
        Array.from(row.children).forEach((key) => {
            const isPressedKey = key.getAttribute('data-key') === keyLabel
                || key.getAttribute('data-shift-key') === keyLabel;
            key.classList.toggle('is-pressed', isPressedKey && isPressed);
        });
    });
    return true;
}

function createTopSection(doc) {
    const section = createSection(doc, 'panel panel-top', 'topArea');
    const title = doc.createElement('h1');
    title.textContent = getAppName();

    const controls = doc.createElement('div');
    controls.className = 'control-row';

    const modeGroup = doc.createElement('div');
    modeGroup.className = 'practice-mode-group';
    modeGroup.setAttribute('role', 'group');
    modeGroup.setAttribute('aria-label', '練習模式');

    const statusRow = doc.createElement('div');
    statusRow.className = 'status-row';
    statusRow.appendChild(createStatusLabel(doc, 'Stopwatch', '0.00s', 'stopwatchValue'));
    statusRow.appendChild(createHighScoreButton(doc, '--'));

    PRACTICE_TARGETS.forEach((target) => {
        modeGroup.appendChild(createTargetButton(doc, target));
    });
    controls.appendChild(modeGroup);

    createControlButtons().forEach((item) => {
        controls.appendChild(createButton(doc, item.id, item.label, 'primary-action'));
    });

    const bar = doc.createElement('div');
    bar.className = 'control-bar';
    bar.appendChild(title);
    bar.appendChild(statusRow);
    bar.appendChild(controls);

    section.appendChild(bar);
    return section;
}

function createPracticeText(doc, target, typedText = '') {
    const container = doc.createElement('div');
    container.className = 'practice-text';

    const text = doc.createElement('p');
    text.className = 'practice-target-text';

    const characterState = getTypedCharacterState(target.text, typedText);
    for (let start = 0; start < target.text.length; start += PRACTICE_CHARS_PER_LINE) {
        const line = doc.createElement('span');
        line.className = 'practice-target-line';

        target.text.slice(start, start + PRACTICE_CHARS_PER_LINE).split('').forEach((character, offset) => {
            const index = start + offset;
            const span = doc.createElement('span');
            span.textContent = character;
            span.className = 'practice-char';

            if (isPracticeGroupEnd(index)) {
                span.classList.add('is-group-end');
            }

            if (characterState[index] === 'correct') {
                span.classList.add('is-correct');
            } else if (characterState[index] === 'incorrect') {
                span.classList.add('is-incorrect');
            } else if (index === typedText.length && typedText.length < target.text.length) {
                span.classList.add('is-current');
            }

            line.appendChild(span);
        });

        text.appendChild(line);
    }

    container.appendChild(text);
    return container;
}

function createMainSection(doc) {
    const section = createSection(doc, 'panel panel-main', 'mainArea');
    const session = getSessionState(doc);
    section.appendChild(createPracticeText(doc, getSelectedPracticeTarget(), session.input));
    return section;
}

function createKeyboardSection(doc) {
    const section = createSection(doc, 'panel panel-bottom', 'keyboardArea');
    const title = doc.createElement('button');
    title.type = 'button';
    title.id = 'toggleKeyboardButton';
    title.className = 'keyboard-titlebar';
    title.textContent = '鍵盤提示';
    title.setAttribute('aria-pressed', 'true');

    const body = doc.createElement('div');
    body.id = 'keyboardBody';
    body.className = 'keyboard-body';

    const keyboard = doc.createElement('div');
    keyboard.className = 'keyboard-layout';

    createKeyboardLayout().forEach((keys, index) => {
        keyboard.appendChild(createKeyboardRow(doc, keys, index));
    });

    body.appendChild(keyboard);
    section.appendChild(title);
    section.appendChild(body);
    updateKeyboardHighlight(doc, getSelectedPracticeTarget(), getSessionState(doc).input);
    return section;
}

function isKeyboardVisible(doc = document) {
    const keyboard = doc.getElementById('keyboardBody');
    return keyboard ? !keyboard.classList.contains('is-hidden') : false;
}

function setKeyboardVisibility(doc, visible) {
    const section = doc.getElementById('keyboardArea');
    const keyboard = doc.getElementById('keyboardBody');
    const button = doc.getElementById('toggleKeyboardButton');

    if (!section || !keyboard || !button) {
        return false;
    }

    section.classList.toggle('is-collapsed', !visible);
    keyboard.classList.toggle('is-hidden', !visible);
    button.setAttribute('aria-pressed', String(visible));
    return true;
}

function toggleKeyboardVisibility(doc = document) {
    return setKeyboardVisibility(doc, !isKeyboardVisible(doc));
}

function updatePracticeTargetButtons(doc, targetId) {
    PRACTICE_TARGETS.forEach((target) => {
        const button = doc.getElementById(`target-${target.id}`);
        if (!button) {
            return;
        }

        const isSelected = target.id === targetId;
        button.className = isSelected ? 'mode-toggle is-selected' : 'mode-toggle';
        button.setAttribute('aria-pressed', String(isSelected));
    });
}

function renderPracticeTarget(doc, targetId) {
    const target = getPracticeTargetById(targetId);
    selectedTargetId = target.id;
    resetSessionState(doc, target.id);

    const mainArea = doc.getElementById('mainArea');
    if (mainArea) {
        mainArea.replaceChildren(createPracticeText(doc, target));
    }

    updatePracticeTargetButtons(doc, target.id);
    updateKeyboardHighlight(doc, target, '');
    updateTimerDisplay(doc);
    updateHighScoreDisplay(doc, target.id);
}

function renderCurrentPracticeText(doc) {
    const mainArea = doc.getElementById('mainArea');
    const session = getSessionState(doc);

    if (!mainArea) {
        return false;
    }

    mainArea.replaceChildren(createPracticeText(doc, getSelectedPracticeTarget(), session.input));
    updateKeyboardHighlight(doc, getSelectedPracticeTarget(), session.input);
    return true;
}

function finalizeSession(doc, nowFn = () => Date.now()) {
    const session = getSessionState(doc);
    if (session.finishedAt !== null) {
        return session;
    }

    session.finishedAt = nowFn();
    session.isCompleted = true;
    clearTimerLoop(session);
    updateTimerDisplay(doc, nowFn);
    const result = updateHighScoreRecord(doc);
    showCompletionDialog(doc, result);
    return session;
}

function clearTimerLoop(session) {
    if (!session || session.timerHandle === null) {
        return;
    }

    if (typeof clearTimeout === 'function') {
        clearTimeout(session.timerHandle);
    }

    session.timerHandle = null;
}

function scheduleTimerLoop(doc) {
    const session = getSessionState(doc);

    if (session.timerHandle !== null || session.isCompleted) {
        return;
    }

    if (typeof setTimeout !== 'function' || !doc.defaultView) {
        return;
    }

    const tick = () => {
        session.timerHandle = null;

        if (session.isCompleted || session.startedAt === null) {
            return;
        }

        updateTimerDisplay(doc);
        session.timerHandle = setTimeout(tick, 16);
    };

    session.timerHandle = setTimeout(tick, 16);
}

function updateHighScoreRecord(doc) {
    const session = getSessionState(doc);

    if (session.startedAt === null) {
        return {
            isNewHighScore: false,
            bestTime: null,
            previousBestTime: null
        };
    }

    const currentHighScore = getHighScoreForTarget(session.targetId);
    const elapsedMs = session.lastElapsedMs;

    if (currentHighScore === null || elapsedMs < currentHighScore) {
        setHighScoreForTarget(session.targetId, elapsedMs);
        updateHighScoreDisplay(doc, session.targetId);
        return {
            isNewHighScore: true,
            bestTime: elapsedMs,
            previousBestTime: currentHighScore
        };
    }

    updateHighScoreDisplay(doc, session.targetId);
    return {
        isNewHighScore: false,
        bestTime: currentHighScore,
        previousBestTime: currentHighScore
    };
}

function getAlertFn(doc) {
    if (typeof doc.alert === 'function') {
        return doc.alert.bind(doc);
    }

    if (typeof alert === 'function') {
        return alert;
    }

    return null;
}

function showCompletionDialog(doc, result = null) {
    const session = getSessionState(doc);
    const bestTime = result && typeof result.bestTime === 'number'
        ? result.bestTime
        : getHighScoreForTarget(session.targetId);
    const isNewHighScore = result ? result.isNewHighScore : false;
    const message = isNewHighScore
        ? `New high score: ${formatElapsedTime(session.lastElapsedMs)}`
        : `Finished in ${formatElapsedTime(session.lastElapsedMs)}. High score: ${formatHighScoreValue(bestTime)}. Difference: ${bestTime === null ? '--' : formatElapsedTime(session.lastElapsedMs - bestTime)}`;

    const alertFn = getAlertFn(doc);
    if (alertFn) {
        alertFn(message);
    }

    return message;
}

function flashErrorBackground(doc) {
    const mainArea = doc.getElementById('mainArea');
    if (!mainArea || !mainArea.classList) {
        return false;
    }

    mainArea.classList.add('is-error-flash');
    if (typeof setTimeout === 'function') {
        setTimeout(() => mainArea.classList.remove('is-error-flash'), 120);
    }
    return true;
}

function handleTypingInput(doc, key, nowFn = () => Date.now()) {
    const session = getSessionState(doc);
    const expectedText = getPracticeText(session.targetId);

    if (session.isCompleted) {
        return session;
    }

    if (key === 'Backspace') {
        session.input = session.input.slice(0, -1);
        renderCurrentPracticeText(doc);
        updateTimerDisplay(doc, nowFn);
        return session;
    }

    if (!isPrintableKey(key)) {
        return session;
    }

    if (session.startedAt === null) {
        session.startedAt = nowFn();
        scheduleTimerLoop(doc);
    }

    const expectedCharacter = expectedText[session.input.length];
    const isIncorrectInput = key !== expectedCharacter;
    session.input += key;
    renderCurrentPracticeText(doc);
    updateTimerDisplay(doc, nowFn);

    if (isIncorrectInput) {
        flashErrorBackground(doc);
    }

    if (session.input === expectedText) {
        finalizeSession(doc, nowFn);
    }

    return session;
}

function bindTypingInput(doc) {
    if (typeof doc.addEventListener !== 'function') {
        return false;
    }

    doc.addEventListener('keydown', (event) => {
        updateKeyboardPressedKey(doc, event.key, true);
        handleTypingInput(doc, event.key);
    });
    doc.addEventListener('keyup', (event) => {
        updateKeyboardPressedKey(doc, event.key, false);
    });
    return true;
}

function createAppShell(doc = document) {
    const app = doc.createElement('div');
    app.id = 'appShell';
    app.className = 'app-shell';

    app.appendChild(createTopSection(doc));
    app.appendChild(createMainSection(doc));
    app.appendChild(createKeyboardSection(doc));

    return app;
}

function bindKeyboardToggle(doc) {
    const button = doc.getElementById('toggleKeyboardButton');

    if (!button) {
        return;
    }

    button.addEventListener('click', () => {
        toggleKeyboardVisibility(doc);
    });
}

function confirmClearHighScore(doc) {
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('typingPracticeHighScores');
    }

    updateHighScoreDisplay(doc);
    return true;
}

function askToClearHighScore(doc) {
    const confirmFn = typeof doc.confirm === 'function'
        ? doc.confirm.bind(doc)
        : (typeof confirm === 'function' ? confirm : null);

    if (!confirmFn) {
        return false;
    }

    if (!confirmFn('Clear high score records?')) {
        return false;
    }

    return confirmClearHighScore(doc);
}

function bindHighScoreButton(doc) {
    const button = doc.getElementById('highScoreButton');
    if (!button) {
        return;
    }

    button.addEventListener('click', () => {
        askToClearHighScore(doc);
    });
}

function bindPracticeTargetButtons(doc) {
    PRACTICE_TARGETS.forEach((target) => {
        const button = doc.getElementById(`target-${target.id}`);
        if (!button) {
            return;
        }

        button.addEventListener('click', () => {
            renderPracticeTarget(doc, target.id);
        });
    });
}

function bindRestartButton(doc) {
    const button = doc.getElementById('restartButton');
    if (!button) {
        return;
    }

    button.addEventListener('click', () => {
        renderPracticeTarget(doc, selectedTargetId);
    });
}

function renderApp(doc = document) {
    const root = doc.getElementById('app');
    if (!root) {
        throw new Error('App root not found');
    }

    resetSessionState(doc, selectedTargetId);
    root.replaceChildren(createAppShell(doc));
    if (typeof doc.registerTree === 'function' && root.children[0]) {
        doc.registerTree(root.children[0]);
    }
    setKeyboardVisibility(doc, true);
    updateKeyboardHighlight(doc);
    bindKeyboardToggle(doc);
    bindHighScoreButton(doc);
    bindPracticeTargetButtons(doc);
    bindRestartButton(doc);
    bindTypingInput(doc);
    updateTimerDisplay(doc);
    updateHighScoreDisplay(doc);
}

function boot() {
    if (typeof document === 'undefined') {
        return;
    }

    renderApp(document);
}

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getAppName,
        PRACTICE_CHARS_PER_LINE,
        PRACTICE_CHARS_PER_GROUP,
        createControlButtons,
        buildRepeatedAlphabet,
        buildAlphabetWithSymbols,
        buildSegmentedAlphabet,
        getPracticeTargetById,
        getSelectedPracticeTarget,
        createKeyboardLayout,
        createSessionState,
        getSessionState,
        resetSessionState,
        formatElapsedTime,
        getHighScoreStorageKey,
        getHighScoreForTarget,
        getTypedCharacterState,
        isPracticeGroupEnd,
        updateKeyboardHighlight,
        updateKeyboardPressedKey,
        updateTimerDisplay,
        updateHighScoreDisplay,
        renderCurrentPracticeText,
        handleTypingInput,
        flashErrorBackground,
        showCompletionDialog,
        createMainSection,
        createKeyboardSection,
        createAppShell,
        isKeyboardVisible,
        setKeyboardVisibility,
        toggleKeyboardVisibility,
        confirmClearHighScore,
        askToClearHighScore,
        renderPracticeTarget,
        renderApp
    };
}
