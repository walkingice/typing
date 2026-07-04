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

* [x] Establish the basic scene flow.
* No real scene implementation is required yet. The UI can be extremely minimal.
* Each scene only needs a basic UI with simple placeholder text.
* Ensure transitions between scenes work correctly.
* Create a shared `state` object in `main.js` to store the game's state across all scenes.

## Phase 2

* [ ] Implement the Intro Scene.
* Allow the user to enter a name.
* Allow the user to choose a difficulty level and a word list before starting the game.
  * Always provide a hardcoded word list containing the letters `a`–`z`.
  * Load additional word lists from `localStorage`, if available.
* Add a gear button in the corner to open the Config Scene.
* The Game Scene does not need a real implementation yet.
  * After the user starts the game and enters the Game Scene, immediately trigger game over.
  * Use a random score for testing.

## Phase 3

* [ ] Implement the Config Scene.
* Allow the user to clear the ranking.
* Allow the user to upload new word lists.
* Allow the user to delete existing word lists.

## Phase 4

* [ ] Implement the Ranking Scene.
* Allow the user to view the ranking.

## Phase 5

* [ ] Implement the Game Scene. The implementation plan has not been decided yet. Stop here.

