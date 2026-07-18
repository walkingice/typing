# Plan

Development plan. The agent **MUST** follow this plan and propose how to achieve each phase.

## Principle

* Development must proceed in phases.
* Each phase consists of multiple steps.
* **DO NOT** proceed to the next phase or step until I explicitly confirm.

## Phase 0

* [x] Create the basic infrastructure.
* Add common test helper functions to `test_lib.js`.
* Add a dummy test case to `test_cases.js` and a corresponding dummy implementation to `main.js`. Ensure the test suite can run successfully.
* Ensure `index.html` loads `main.js` correctly.

## Phase 1

* [ ] Create basic UI.
* No real scene implementation is required yet. The UI can be extremely minimal.
* Divide the screen into three main areas and set up the buttons for the top control area.

## Phase 2

* [ ] Render Keyboard area.
* No functional implementation is required; just render the keyboard area.
* Ensure the keyboard area can be toggled on/off.

## Phase 3

* [ ] Implement Control area buttons.
* Game logic is not required yet.
* Selecting a practice target should update the main screen content.

## Phase 4

* [ ] Implement core logic.
* The stopwatch starts timing once text input begins.
* Update the UI based on whether the input text is correct.
* Determine if the practice session is completed.
