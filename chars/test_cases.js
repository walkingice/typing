const { describe, it, assert, assertEqual, getSummary } = require('./test_lib.js');
const { getAppName, createControlButtons, createAppShell, renderApp } = require('./main.js');

function createMockElement(tagName) {
    return {
        tagName: tagName.toUpperCase(),
        id: '',
        className: '',
        textContent: '',
        type: '',
        children: [],
        appendChild(child) {
            this.children.push(child);
            return child;
        }
    };
}

function createMockDocument() {
    const root = createMockElement('div');
    root.replaceChildren = function(child) {
        this.children = [child];
    };

    return {
        body: root,
        createElement(tagName) {
            return createMockElement(tagName);
        },
        getElementById(id) {
            return id === 'app' ? root : null;
        }
    };
}

describe('Basic Infrastructure', () => {
    it('should return correct application name', () => {
        assertEqual(getAppName(), 'Typing Practice');
    });
});

describe('Phase 1 UI shell', () => {
    it('should expose the control buttons for the top area', () => {
        const buttons = createControlButtons();
        assertEqual(buttons.length, 2);
        assertEqual(buttons[0].id, 'clearRecordsButton');
        assertEqual(buttons[0].label, 'Clear Records');
        assertEqual(buttons[1].id, 'restartButton');
        assertEqual(buttons[1].label, 'Restart');
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

const summary = getSummary();
console.log(`\nTest results: ${summary.passes} passed, ${summary.failures} failed.`);
if (summary.failures > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
