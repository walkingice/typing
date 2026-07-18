const { describe, it, assert, assertEqual, getSummary } = require('./test_lib.js');
const {
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
    createMainSection,
    createKeyboardSection,
    createAppShell,
    isKeyboardVisible,
    setKeyboardVisibility,
    renderPracticeTarget,
    toggleKeyboardVisibility,
    askToClearHighScore,
    updateTimerDisplay,
    handleTypingInput,
    renderApp
} = require('./main.js');

function createMockElement(tagName) {
    const classSet = new Set();
    let classNameValue = '';
    const element = {
        tagName: tagName.toUpperCase(),
        _id: '',
        get className() {
            return classNameValue;
        },
        set className(value) {
            classNameValue = String(value);
            classSet.clear();
            classNameValue.split(/\s+/).filter(Boolean).forEach((name) => classSet.add(name));
        },
        textContent: '',
        type: '',
        attributes: {},
        listeners: {},
        children: [],
        confirm: null,
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
                classNameValue = Array.from(classSet).join(' ');
            },
            owner: null
        },
        appendChild(child) {
            this.children.push(child);
            return child;
        },
        replaceChildren(child) {
            this.children = child ? [child] : [];
        },
        setAttribute(name, value) {
            this.attributes[name] = String(value);
        },
        addEventListener(type, handler) {
            this.listeners[type] = handler;
        },
        click() {
            if (this.listeners.click) {
                this.listeners.click();
            }
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
        listeners: {},
        createElement(tagName) {
            return createMockElement(tagName);
        },
        getElementById(id) {
            return elements[id] || null;
        },
        addEventListener(type, handler) {
            this.listeners[type] = handler;
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
    return shell.children[2].children[0];
}

function getPracticeTargetButtons(shell) {
    return Array.from(shell.children[0].children[0].children[2].children).filter((button) => {
        const id = button.id || '';
        return id.startsWith('target-');
    });
}

describe('Basic Infrastructure', () => {
    it('should return correct application name', () => {
        assertEqual(getAppName(), 'Typing Practice');
    });
});

describe('Phase 1 UI shell', () => {
    it('should expose the control buttons for the top area', () => {
        const buttons = createControlButtons();
        assertEqual(buttons.length, 1);
        assertEqual(buttons[0].id, 'restartButton');
        assertEqual(buttons[0].label, 'Restart');
    });

    it('should build practice target text sets', () => {
        assertEqual(buildRepeatedAlphabet(2), 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz');
        assertEqual(buildAlphabetWithSymbols(1), 'abcdefghijklmnopqrstuvwxyz!@.-');
        assertEqual(
            buildSegmentedAlphabet(),
            'abcdefgabcdefgabcdefghijklmnhijklmnhijklmnopqrstuopqrstuopqrstuvwxyzvwxyzvwxyz'
        );
    });

    it('should expose the selected practice target', () => {
        const target = getSelectedPracticeTarget();

        assertEqual(target.id, 'lowercaseTwice');
        assertEqual(target.text, buildRepeatedAlphabet(2));
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

    it('should render the selected practice target in the main area', () => {
        const doc = createMockDocument();
        const main = createMainSection(doc);

        assertEqual(main.id, 'mainArea');
        assertEqual(main.children.length, 1);
        assertEqual(main.children[0].children[0].textContent, '字母');
        assertEqual(main.children[0].children[2].children.length, buildRepeatedAlphabet(2).length);
        assertEqual(main.children[0].children[2].children[0].textContent, 'a');
    });

    it('should render the app shell into the root element', () => {
        const doc = createMockDocument();
        renderApp(doc);

        assertEqual(doc.body.children.length, 1);
        assertEqual(doc.body.children[0].id, 'appShell');
        assertEqual(doc.body.children[0].children[0].id, 'topArea');
    });

    it('should format elapsed time to two decimal places', () => {
        assertEqual(formatElapsedTime(0), '0.00s');
        assertEqual(formatElapsedTime(64420), '64.42s');
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
        assertEqual(keyboard.children[1].id, 'keyboardBody');
        assertEqual(keyboard.children[1].children.length, 1);
        assertEqual(keyboard.children[1].children[0].children.length, 3);
    });

    it('should toggle keyboard visibility state', () => {
        const doc = createMockDocument();
        const shell = createAppShell(doc);
        const keyboard = shell.children[2];
        const keyboardBody = keyboard.children[1];
        const button = getKeyboardToggleButton(shell);
        registerAppTree(doc, shell);

        assertEqual(isKeyboardVisible({
            getElementById(id) {
                return id === 'keyboardBody' ? keyboardBody : null;
            }
        }), true);

        assertEqual(setKeyboardVisibility(doc, false), true);
        assertEqual(keyboard.classList.contains('is-collapsed'), true);
        assertEqual(keyboardBody.classList.contains('is-hidden'), true);
        assertEqual(button.textContent, 'Keyboard area');
        assertEqual(button.attributes['aria-pressed'], 'false');

        assertEqual(toggleKeyboardVisibility(doc), true);
        assertEqual(keyboard.classList.contains('is-collapsed'), false);
        assertEqual(keyboardBody.classList.contains('is-hidden'), false);
        assertEqual(button.textContent, 'Keyboard area');
        assertEqual(button.attributes['aria-pressed'], 'true');
    });
});

describe('Phase 3 control area', () => {
    it('should render practice target buttons in the control area', () => {
        const doc = createMockDocument();
        const shell = createAppShell(doc);
        const buttons = getPracticeTargetButtons(shell);

        assertEqual(buttons.length, 3);
        assertEqual(buttons[0].id, 'target-lowercaseTwice');
        assertEqual(buttons[0].attributes['aria-pressed'], 'true');
        assertEqual(buttons[1].attributes['aria-pressed'], 'false');
        assertEqual(buttons[0].textContent, '字母');
        assertEqual(buttons[1].textContent, '字母符號');
        assertEqual(buttons[2].textContent, '字母反覆');
    });

    it('should update main content when selecting a practice target', () => {
        const doc = createMockDocument();
        renderApp(doc);
        const shell = doc.body.children[0];
        registerAppTree(doc, shell);

        const mainArea = doc.getElementById('mainArea');
        const targetButtons = getPracticeTargetButtons(shell);

        assertEqual(mainArea.children[0].children[0].textContent, '字母');

        targetButtons[1].click();

        assertEqual(doc.getElementById('mainArea').children[0].children[0].textContent, '字母符號');
        assertEqual(targetButtons[0].attributes['aria-pressed'], 'false');
        assertEqual(targetButtons[1].attributes['aria-pressed'], 'true');
    });

    it('should keep the selected target after restart', () => {
        const doc = createMockDocument();
        renderApp(doc);
        const shell = doc.body.children[0];
        registerAppTree(doc, shell);

        const targetButtons = getPracticeTargetButtons(shell);
        targetButtons[2].click();
        doc.getElementById('restartButton').click();

        assertEqual(doc.getElementById('mainArea').children[0].children[0].textContent, '字母反覆');
    });

    it('should clear stored high scores after confirmation', () => {
        const doc = createMockDocument();
        doc.confirm = () => true;
        renderApp(doc);
        const shell = doc.body.children[0];
        registerAppTree(doc, shell);

        localStorage.setItem('typingPracticeHighScores', '1');
        doc.getElementById('highScoreButton').click();

        assertEqual(localStorage.getItem('typingPracticeHighScores'), null);
    });

    it('should keep stored high scores when confirmation is cancelled', () => {
        const doc = createMockDocument();
        doc.confirm = () => false;
        renderApp(doc);
        const shell = doc.body.children[0];
        registerAppTree(doc, shell);

        localStorage.setItem('typingPracticeHighScores', '1');
        askToClearHighScore(doc);

        assertEqual(localStorage.getItem('typingPracticeHighScores'), '1');
    });
});

describe('Phase 4 core logic', () => {
    it('should create and reset session state', () => {
        const session = createSessionState('lowercaseTwice');
        assertEqual(session.targetId, 'lowercaseTwice');
        assertEqual(session.input, '');
        assertEqual(session.startedAt, null);

        const doc = createMockDocument();
        const reset = resetSessionState(doc, 'symbolsTwice');
        assertEqual(getSessionState(doc).targetId, 'symbolsTwice');
        assertEqual(reset.input, '');
    });

    it('should map typed characters to correct and incorrect states', () => {
        assertEqual(getTypedCharacterState('abc', '' ).join(','), 'pending,pending,pending');
        assertEqual(getTypedCharacterState('abc', 'ab').join(','), 'correct,correct,pending');
        assertEqual(getTypedCharacterState('abc', 'ax').join(','), 'correct,incorrect,pending');
    });

    it('should start timing on first printable input and update rendering', () => {
        const doc = createMockDocument();
        renderApp(doc);
        registerAppTree(doc, doc.body.children[0]);

        handleTypingInput(doc, 'a', () => 1000);
        assertEqual(getSessionState(doc).startedAt, 1000);
        assertEqual(doc.getElementById('stopwatchValue').textContent, '0.00s');

        updateTimerDisplay(doc, () => 2650);
        assertEqual(doc.getElementById('stopwatchValue').textContent, '1.65s');
    });

    it('should mark typed characters as correct and incorrect', () => {
        const doc = createMockDocument();
        renderApp(doc);
        registerAppTree(doc, doc.body.children[0]);

        handleTypingInput(doc, 'a', () => 1000);
        handleTypingInput(doc, 'b', () => 1200);

        const mainText = doc.getElementById('mainArea').children[0].children[2];
        assertEqual(mainText.children[0].classList.contains('is-correct'), true);
        assertEqual(mainText.children[1].classList.contains('is-correct'), true);
        assertEqual(mainText.children[2].classList.contains('is-current'), true);

        handleTypingInput(doc, 'x', () => 1400);
        assertEqual(doc.getElementById('mainArea').children[0].children[2].children[2].classList.contains('is-incorrect'), true);
    });

    it('should support Backspace and complete the session on exact match', () => {
        const doc = createMockDocument();
        renderApp(doc);
        registerAppTree(doc, doc.body.children[0]);

        handleTypingInput(doc, 'a', () => 1000);
        handleTypingInput(doc, 'b', () => 1100);
        handleTypingInput(doc, 'Backspace', () => 1200);

        assertEqual(getSessionState(doc).input, 'a');
        assertEqual(doc.getElementById('mainArea').children[0].children[2].children[1].classList.contains('is-current'), true);

        const session = resetSessionState(doc, 'lowercaseTwice');
        const expected = getPracticeTargetById(session.targetId).text;
        expected.split('').forEach((character, index) => {
            handleTypingInput(doc, character, () => 1000 + index * 100);
        });

        assertEqual(getSessionState(doc).isCompleted, true);
        assertEqual(getSessionState(doc).finishedAt !== null, true);
        assertEqual(getSessionState(doc).input, expected);
    });
});

const summary = getSummary();
console.log(`\nTest results: ${summary.passes} passed, ${summary.failures} failed.`);
if (summary.failures > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
