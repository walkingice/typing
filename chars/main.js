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
    section.appendChild(actionRow);
    return section;
}

function createPracticeText(doc, target) {
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
    text.textContent = target.text;

    container.appendChild(heading);
    container.appendChild(description);
    container.appendChild(text);
    return container;
}

function createMainSection(doc) {
    const section = createSection(doc, 'panel panel-main', 'mainArea');
    section.appendChild(createPracticeText(doc, getSelectedPracticeTarget()));
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

    const mainArea = doc.getElementById('mainArea');
    if (mainArea) {
        mainArea.replaceChildren(createPracticeText(doc, target));
    }

    updatePracticeTargetButtons(doc, target.id);
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

    root.replaceChildren(createAppShell(doc));
    if (typeof doc.registerTree === 'function' && root.children[0]) {
        doc.registerTree(root.children[0]);
    }
    setKeyboardVisibility(doc, true);
    bindKeyboardToggle(doc);
    bindPracticeTargetButtons(doc);
    bindClearRecordsButton(doc);
    bindRestartButton(doc);
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
