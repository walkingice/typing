# Game Rules


*  A typing practice game for letters or symbols with adjustable practice targets.
*  After selecting a target, the stopwatch resets to zero and stays paused until the user presses the first key. Stopwatch precision: two decimal places (e.g., 64.42s).
*  Once all text is entered correctly, the stopwatch stops and displays the results: either a new high score or the time difference from the high score.
*  High scores are categorized by practice targets and saved in localStorage.
*  Three practice targets:
    * 字母
    * 字母符號
    * 字母反覆

## UI

* Single main screen divided into three sections: Top (Control), Middle (Main), and Bottom (Keyboard).
* The keyboard area can be toggled by clicking its title bar. When off, it is hidden and the Main area expands to fill the space. When on, the keyboard occupies the bottom quarter of the screen.
* Keyboard area: Displays a simplified keyboard layout. The key corresponding to the current character to be typed will be highlighted.
* Control area: Displays the stopwatch, high score (if any), the three practice targets (the selected one is highlighted), and a Restart button. Clicking the high score prompts for confirmation before clearing stored records.

## UX

* Main area: Displays the text to be typed. Correctly typed characters turn green; incorrect ones turn red. Pressing Backspace deletes the last character.
* Visual cue: The background flashes dark red briefly upon incorrect input to alert the user.
