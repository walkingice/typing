// main.js - Typing Practice App Shell

function getAppName() {
    return 'Typing Practice';
}

function createControlButtons() {
    return [
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
    const section = createSection(doc, 'panel panel-bottom', 'keyboardArea', 'Keyboard area');
    return section;
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

function renderApp(doc = document) {
    const root = doc.getElementById('app');
    if (!root) {
        throw new Error('App root not found');
    }

    root.replaceChildren(createAppShell(doc));
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
        createAppShell,
        renderApp
    };
}
