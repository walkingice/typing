# Game Rules

* A typing game with adjustable difficulty levels.
* Supports any language through custom word lists.
* Similar to Tetris: word blocks fall from the top.
* Typing a matching word removes its falling block and awards points.
* Once a block reaches the bottom or lands on another block, it becomes solid and cannot be removed.
* The game ends when the stacked blocks reach the top.
* Based on the selected difficulty, a new block falls from a random horizontal position at fixed intervals.
* Each block displays a randomly selected word from the active word list, avoiding duplicates whenever possible.

# Scenes

1. Intro
   * Enter a player name.
   * Could open Config scene
   * Select a difficulty level and a word list.
   * Start the game.
2. Config
    * Manage word lists.
3. Game
   * A text input at the bottom for typing.
   * A score display.
   * A play area showing the falling blocks.

4. Ranking & Settings
   * View rankings.

Users can switch freely between the Intro and Ranking scenes.

# Game Spec

## System Configurations & Layout

* Configurable Parameters: All game parameters are defined as `const` in the source code, allowing for easy adjustment and fine-tuning later.
* Grid Layout: The game board consists of a **20x20 grid**.
* Word Blocks: Each block spans **1x1 to 4x1 cells**, dynamically adjusting based on the word length.

## Movement & Spawning

* Spawn Mechanics: Blocks spawn horizontally at random positions and fall from the top of the grid.
* Fall Speed: Blocks move down by 1 cell per tick. Speed scales by difficulty:
    * Easy: 1 tick = 1.0 second
    * Normal: 1 tick = 0.8 seconds
    * Hard: 1 tick = 0.5 seconds
* Spawn Timing: A new block spawns immediately if the board is completely cleared. Otherwise, a new block spawns **every 3 ticks**.

## Game Logic & Input

* Scoring System: Score = Base Multiplier × Number of Cells.
    * Easy: Base = 1
    * Normal: Base = 5 (e.g., a 3-cell block yields 15 points)
    * Hard: Base = 10
* Input Matching: Listen to every change in user input in real-time. If the input matches and clears a falling block, **automatically clear the user input field**.
* During each check, comparison begins sequentially from the lowest block that is still falling. If the user input contains the content of the block, it is considered a successful match. Clear the first successfully matched block and increase the score.
* Escape Key: Pressing **ESC** or **ENTER** instantly clears the user input field.

# Data Structure

* `localStorage` contains two entries:
  * `"ranking": [{"name": "Foo", "score": 123}, ...]` (stores up to 10 records)
  * `"words_list": [{"name": "Foo", "words": ["apple", "banana", "cake", ...]}, ...]`
* `words_list` always includes a default list containing `a`–`z`.
* On startup, the player enters a name, selects a word list, and starts the game.
* The **Ranking & Settings** scene allows users to delete existing word lists or upload new ones.

Uploaded word list files use the following format:

* Line 1: Word list name
* Line 2 onward: One word per line
