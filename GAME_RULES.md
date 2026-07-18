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
