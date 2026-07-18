const { describe, it, assert, assertEqual, getSummary } = require('./test_lib.js');
const {
    getAppName,
    createControlButtons,
    createKeyboardLayout,
    createKeyboardSection,
    createAppShell,
    isKeyboardVisible,
    setKeyboardVisibility,
    toggleKeyboardVisibility,
    renderApp
} = require('./main.js');

function createMockElement(tagName) {
    const classSet = new Set();
    const element = {
        tagName: tagName.toUpperCase(),
        _id: '',
        className: '',
        textContent: '',
        type: '',
        attributes: {},
        children: [],
        classList: {
            add(...names) {
                names.forEach((name) => classSet.add(name));
                this.sync();
            },
            remove(...names) {
                names.forEach((name) => classSet.delete(name));
                this.sync();
            },
            contains(name) {
                return classSet.has(name);
            },
            toggle(name, force) {
                if (force === true) {
                    classSet.add(name);
                    this.sync();
                    return true;
                }
                if (force === false) {
                    classSet.delete(name);
                    this.sync();
                    return false;
                }
                if (classSet.has(name)) {
                    classSet.delete(name);
                    this.sync();
                    return false;
                }
                classSet.add(name);
                this.sync();
                return true;
            },
            sync() {
                this.owner.className = Array.from(classSet).join(' ');
            },
            owner: null
        },
        appendChild(child) {
            this.children.push(child);
            return child;
        },
        setAttribute(name, value) {
            this.attributes[name] = String(value);
        },
        get id() {
            return this._id;
        },
        set id(value) {
            this._id = value;
        }
    };
    element.classList.owner = element;
    return element;
}

function createMockDocument() {
    const root = createMockElement('div');
    root.replaceChildren = function(child) {
        this.children = [child];
    };

    const elements = { app: root };

    function registerTree(node) {
        if (node && node.id) {
            elements[node.id] = node;
        }
        if (node && node.children) {
            node.children.forEach(registerTree);
        }
    }

    return {
        body: root,
        createElement(tagName) {
            return createMockElement(tagName);
        },
        getElementById(id) {
            return elements[id] || null;
        },
        registerElement(element) {
            elements[element.id] = element;
            registerTree(element);
            return element;
        },
        registerTree
    };
}

function registerAppTree(doc, node) {
    if (!node) {
        return;
    }
    doc.registerElement(node);
    if (node.children) {
        node.children.forEach((child) => registerAppTree(doc, child));
    }
}

function getKeyboardToggleButton(shell) {
    return shell.children[0].children[1].children[0];
}

describe('Basic Infrastructure', () => {
    it('should return correct application name', () => {
        assertEqual(getAppName(), 'Typing Practice');
    });
});

describe('Phase 1 UI shell', () => {
    it('should expose the control buttons for the top area', () => {
        const buttons = createControlButtons();
        assertEqual(buttons.length, 3);
        assertEqual(buttons[0].id, 'toggleKeyboardButton');
        assertEqual(buttons[0].label, 'Keyboard: On');
        assertEqual(buttons[1].id, 'clearRecordsButton');
        assertEqual(buttons[1].label, 'Clear Records');
        assertEqual(buttons[2].id, 'restartButton');
        assertEqual(buttons[2].label, 'Restart');
    });

    it('should create three main areas in the app shell', () => {
        const doc = createMockDocument();
        const shell = createAppShell(doc);

        assertEqual(shell.id, 'appShell');
        assertEqual(shell.children.length, 3);
        assertEqual(shell.children[0].id, 'topArea');
        assertEqual(shell.children[1].id, 'mainArea');
        assertEqual(shell.children[2].id, 'keyboardArea');
    });

    it('should render the app shell into the root element', () => {
        const doc = createMockDocument();
        renderApp(doc);

        assertEqual(doc.body.children.length, 1);
        assertEqual(doc.body.children[0].id, 'appShell');
        assertEqual(doc.body.children[0].children[0].id, 'topArea');
    });
});

describe('Phase 2 keyboard area', () => {
    it('should create the keyboard layout rows', () => {
        const layout = createKeyboardLayout();

        assertEqual(layout.length, 3);
        assertEqual(layout[0][0], 'q');
        assertEqual(layout[2][6], 'm');
    });

    it('should render the keyboard area content', () => {
        const doc = createMockDocument();
        const keyboard = createKeyboardSection(doc);

        assertEqual(keyboard.id, 'keyboardArea');
        assertEqual(keyboard.children.length, 2);
        assertEqual(keyboard.children[0].textContent, 'Keyboard area');
        assertEqual(keyboard.children[1].children.length, 3);
    });

    it('should toggle keyboard visibility state', () => {
        const doc = createMockDocument();
        const shell = createAppShell(doc);
        const keyboard = shell.children[2];
        const button = getKeyboardToggleButton(shell);
        registerAppTree(doc, shell);

        assertEqual(isKeyboardVisible({
            getElementById(id) {
                return id === 'keyboardArea' ? keyboard : null;
            }
        }), true);

        assertEqual(setKeyboardVisibility(doc, false), true);
        assertEqual(keyboard.classList.contains('is-hidden'), true);
        assertEqual(button.textContent, 'Keyboard: Off');
        assertEqual(button.attributes['aria-pressed'], 'false');

        assertEqual(toggleKeyboardVisibility(doc), true);
        assertEqual(keyboard.classList.contains('is-hidden'), false);
        assertEqual(button.textContent, 'Keyboard: On');
        assertEqual(button.attributes['aria-pressed'], 'true');
    });
});

const summary = getSummary();
console.log(`\nTest results: ${summary.passes} passed, ${summary.failures} failed.`);
if (summary.failures > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
