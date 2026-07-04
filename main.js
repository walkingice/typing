// main.js - Typing Game Implementation

const state = {
    currentScene: 'intro',
    playerName: '',
    difficulty: 'normal',
    wordList: 'default',
    score: 0
};

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
    }
}

function init() {
    if (typeof document === 'undefined') return;

    // Intro Buttons
    document.getElementById('startGameBtn')?.addEventListener('click', () => {
        switchScene('game');
    });

    document.getElementById('showRankBtn')?.addEventListener('click', () => {
        switchScene('rank');
    });

    document.getElementById('showConfigBtn')?.addEventListener('click', () => {
        switchScene('config');
    });

    // Config Buttons
    document.getElementById('backFromConfigBtn')?.addEventListener('click', () => {
        switchScene('intro');
    });

    // Game Buttons
    document.getElementById('backFromGameBtn')?.addEventListener('click', () => {
        switchScene('intro');
    });

    // Rank Buttons
    document.getElementById('backFromRankBtn')?.addEventListener('click', () => {
        switchScene('intro');
    });
}

// Auto-init on DOMContentLoaded in browser
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', init);
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        state,
        switchScene,
        init
    };
}
