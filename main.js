// main.js - Typing Game Implementation

function getAppName() {
    return 'Typing Game';
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getAppName
    };
}
