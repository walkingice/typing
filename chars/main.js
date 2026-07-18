// main.js - Typing Practice App Shell

const PRACTICE_TARGETS = [
    {
        id: 'lowercaseTwice',
        label: 'a-z x2',
        description: 'Lowercase letters a-z, repeated twice.',
        text: buildRepeatedAlphabet(2)
    },
    {
        id: 'symbolsTwice',
        label: 'a-z + symbols x2',
        description: 'Lowercase letters a-z and common half-width symbols (!),@.-, repeated twice.',
        text: buildAlphabetWithSymbols(2)
    },
    {
        id: 'alphabetSegments',
        label: '7-letter segments x3',
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
        { id: 'toggleKeyboardButton', label: 'Keyboard: On' },
        { id: 'clearRecordsButton', label: 'Clear Records' },
        { id: 'restartButton', label: 'Restart' }
    ];
}

function createSessionState(targetId = selectedTargetId) {
    return {
        targetId,
        input: '',
        startedAt: null,
        finishedAt: null,
        isCompleted: false,
        lastElapsedMs: 0
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
    return setSessionState(doc, createSessionState(targetId));
}

function buildRepeatedAlphabet(repeatCount) {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    return Array.from({ length: repeatCount }, () => letters).join('');
}

function buildAlphabetWithSymbols(repeatCount) {
    const letters = 'abcdefghijklmnopqrstuvwxyz!@.-';
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
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm']
    ];
}

function createKeyboardKey(doc, keyLabel) {
    const key = doc.createElement('div');
    key.className = 'keyboard-key';
    key.textContent = keyLabel;
    return key;
}

function createTargetButton(doc, target) {
    const button = createButton(doc, `target-${target.id}`, target.label, 'secondary');
    button.setAttribute('data-target-id', target.id);
    button.setAttribute('aria-pressed', String(target.id === selectedTargetId));
    if (target.id === selectedTargetId) {
        button.className = 'secondary is-selected';
    }
    return button;
}

function createKeyboardRow(doc, keys) {
    const row = doc.createElement('div');
    row.className = 'keyboard-row';

    keys.forEach((keyLabel) => {
        row.appendChild(createKeyboardKey(doc, keyLabel));
    });

    return row;
}

function createTopSection(doc) {
    const section = createSection(doc, 'panel panel-top', 'topArea');
    const title = doc.createElement('h1');
    title.textContent = getAppName();

    const statusRow = doc.createElement('div');
    statusRow.className = 'status-row';
    statusRow.appendChild(createStatusLabel(doc, 'Stopwatch', '0.00s', 'stopwatchValue'));
    statusRow.appendChild(createStatusLabel(doc, 'High Score', '--', 'highScoreValue'));

    const targetRow = doc.createElement('div');
    targetRow.className = 'control-row';

    PRACTICE_TARGETS.forEach((target) => {
        targetRow.appendChild(createTargetButton(doc, target));
    });

    const controls = doc.createElement('div');
    controls.className = 'control-row';

    createControlButtons().forEach((item, index) => {
        const variant = index === 0 ? 'secondary' : '';
        controls.appendChild(createButton(doc, item.id, item.label, variant));
    });

    const actionRow = doc.createElement('div');
    actionRow.className = 'top-actions';
    actionRow.appendChild(targetRow);
    actionRow.appendChild(controls);

    section.appendChild(title);
    section.appendChild(statusRow);
    section.appendChild(actionRow);
    return section;
}

function createPracticeText(doc, target, typedText = '') {
    const container = doc.createElement('div');
    container.className = 'practice-text';

    const heading = doc.createElement('p');
    heading.className = 'practice-target-label';
    heading.textContent = target.label;

    const description = doc.createElement('p');
    description.className = 'practice-target-description';
    description.textContent = target.description;

    const text = doc.createElement('p');
    text.className = 'practice-target-text';

    const characterState = getTypedCharacterState(target.text, typedText);
    target.text.split('').forEach((character, index) => {
        const span = doc.createElement('span');
        span.textContent = character;
        span.className = 'practice-char';

        if (characterState[index] === 'correct') {
            span.classList.add('is-correct');
        } else if (characterState[index] === 'incorrect') {
            span.classList.add('is-incorrect');
        } else if (index === typedText.length && typedText.length < target.text.length) {
            span.classList.add('is-current');
        }

        text.appendChild(span);
    });

    container.appendChild(heading);
    container.appendChild(description);
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
    const title = doc.createElement('p');
    title.className = 'keyboard-title';
    title.textContent = 'Keyboard area';

    const keyboard = doc.createElement('div');
    keyboard.className = 'keyboard-layout';

    createKeyboardLayout().forEach((keys) => {
        keyboard.appendChild(createKeyboardRow(doc, keys));
    });

    section.appendChild(title);
    section.appendChild(keyboard);
    return section;
}

function isKeyboardVisible(doc = document) {
    const keyboard = doc.getElementById('keyboardArea');
    return keyboard ? !keyboard.classList.contains('is-hidden') : false;
}

function setKeyboardVisibility(doc, visible) {
    const keyboard = doc.getElementById('keyboardArea');
    const button = doc.getElementById('toggleKeyboardButton');

    if (!keyboard || !button) {
        return false;
    }

    keyboard.classList.toggle('is-hidden', !visible);
    button.textContent = visible ? 'Keyboard: On' : 'Keyboard: Off';
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
        button.className = isSelected ? 'secondary is-selected' : 'secondary';
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
    updateTimerDisplay(doc);
}

function renderCurrentPracticeText(doc) {
    const mainArea = doc.getElementById('mainArea');
    const session = getSessionState(doc);

    if (!mainArea) {
        return false;
    }

    mainArea.replaceChildren(createPracticeText(doc, getSelectedPracticeTarget(), session.input));
    return true;
}

function finalizeSession(doc, nowFn = () => Date.now()) {
    const session = getSessionState(doc);
    if (session.finishedAt !== null) {
        return session;
    }

    session.finishedAt = nowFn();
    session.isCompleted = true;
    updateTimerDisplay(doc, nowFn);
    return session;
}

function flashErrorBackground(doc) {
    const body = doc.body || doc.documentElement;
    if (!body || !body.classList) {
        return false;
    }

    body.classList.add('is-error-flash');
    if (typeof setTimeout === 'function') {
        setTimeout(() => body.classList.remove('is-error-flash'), 120);
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
    }

    session.input += key;
    renderCurrentPracticeText(doc);
    updateTimerDisplay(doc, nowFn);

    if (!expectedText.startsWith(session.input)) {
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
        handleTypingInput(doc, event.key);
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

function bindClearRecordsButton(doc) {
    const button = doc.getElementById('clearRecordsButton');
    if (!button) {
        return;
    }

    button.addEventListener('click', () => {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('typingPracticeHighScores');
        }
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
    bindKeyboardToggle(doc);
    bindPracticeTargetButtons(doc);
    bindClearRecordsButton(doc);
    bindRestartButton(doc);
    bindTypingInput(doc);
    updateTimerDisplay(doc);
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
        getTypedCharacterState,
        updateTimerDisplay,
        renderCurrentPracticeText,
        handleTypingInput,
        createMainSection,
        createKeyboardSection,
        createAppShell,
        isKeyboardVisible,
        setKeyboardVisibility,
        toggleKeyboardVisibility,
        renderPracticeTarget,
        renderApp
    };
}
