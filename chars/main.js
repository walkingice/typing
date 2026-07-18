// main.js - Typing Practice App Shell

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

    const controls = doc.createElement('div');
    controls.className = 'control-row';

    createControlButtons().forEach((item, index) => {
        const variant = index === 0 ? 'secondary' : '';
        controls.appendChild(createButton(doc, item.id, item.label, variant));
    });

    section.appendChild(title);
    section.appendChild(controls);
    return section;
}

function createMainSection(doc) {
    const section = createSection(doc, 'panel panel-main', 'mainArea', 'Main area');
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

function renderApp(doc = document) {
    const root = doc.getElementById('app');
    if (!root) {
        throw new Error('App root not found');
    }

    root.replaceChildren(createAppShell(doc));
    setKeyboardVisibility(doc, true);
    bindKeyboardToggle(doc);
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
        createKeyboardLayout,
        createKeyboardSection,
        createAppShell,
        isKeyboardVisible,
        setKeyboardVisibility,
        toggleKeyboardVisibility,
        renderApp
    };
}
