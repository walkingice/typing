## Development Rules

* Keep functions small. Refactor any function longer than 50 lines.
* Each change should focus on a single feature or a small goal.
* Every change must include corresponding unit tests.

## Architecture

* Use only vanilla JavaScript, HTML, and CSS. No third-party libraries.
* Use a single `index.html` containing all CSS.
* Use a single `main.js` for all implementation, included by `index.html`.
* Use a single `test_lib.js` for shared test utilities.
* Use a single `test_cases.js` as the test entry point. Run tests with `node test_cases.js`, which loads `test_lib.js` and `main.js`.
* Data stores in localStorage.

## Implementation

* Read the game rules from `@GAME_RULES.md`.
* Read the current development plan from `@PLANS.md`.

