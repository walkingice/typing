const assert = require('assert');
const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

assert.match(html, /id="chars-tab"[\s\S]*data-game="chars"[\s\S]*>\s*字母\s*</);
assert.match(html, /id="words-tab"[\s\S]*data-game="words"[\s\S]*>\s*單字\s*</);
assert.match(html, /id="words-game" src="words\/index\.html"/);
assert.match(html, /id="chars-game" src="chars\/index\.html"/);
assert.match(html, /id="chars-tab"[\s\S]*aria-selected="true"/);
assert.match(html, /id="words-game"[\s\S]*hidden/);
assert.match(html, /\.navigation \{[\s\S]*width: 5vw;[\s\S]*flex-direction: column;/);
assert.match(html, /aria-orientation="vertical"/);
assert.match(html, /\.game-frame \{[\s\S]*width: 95vw;[\s\S]*height: 100vh;/);
assert.match(html, /scrolling="no"/g);
assert.match(html, /function resizeFrame\(frame\)/);
assert.match(html, /documentElement\.scrollHeight/);
assert.match(html, /Math\.max\(contentHeight, window\.innerHeight\)/);
assert.match(html, /new ResizeObserver/);
assert.match(html, /function selectGame\(game\)/);

console.log('Root integration tests passed.');
