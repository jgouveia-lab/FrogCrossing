# Croak Crossing

[Click here to see deployed game]

## Description

A Frogger inspired road crossing game built with vanilla JavaScript and DOM manipulation. Move a frog from the bottom of the screen to the top, avoiding lanes of moving cars. Reach the top to win, run out of lives and it's game over. Single HTML page, no canvas, no frameworks.

## MVP

- Open the game from a public link and see a splash screen explaining the goal
- Start a game and control the frog with arrow keys to cross lanes of moving traffic
- See lives and progress (crossings) at all times while playing
- Get hit by a car, lose a life, and keep playing without the game resetting entirely
- Reach the top of the board and be told clearly that you won
- Run out of lives and be told clearly that the game is over
- Restart and play again immediately, from either outcome, without reloading the page

## Backlog

- Sound effects (hop, collision, win)
- Personal high score saved with localStorage
- Increasing difficulty per crossing (faster cars, more lanes)
- On-screen touch controls for mobile
- Custom visual theme/sprites instead of emoji

## Data structure

**`Game`** — owns overall state and the render loop
- `state` — `'splash' | 'playing' | 'gameover'`
- `lives`, `crossings`
- `init()` — builds the board, attaches listeners
- `start()` — resets state, kicks off the animation loop
- `loop()` — runs every frame: updates cars, checks collisions
- `handleInput(direction)` — moves the frog if the game is playing
- `checkWin()` / `checkCollision()`
- `endRound(result)` — shows the win or game-over overlay
- `restart()` — resets lives, crossings, frog position

**`Frog`**
- `row`, `col` — grid position
- `move(dRow, dCol)` — updates position within board bounds
- `reset()` — returns to starting row/col

**`Car`**
- `lane`, `left`, `width`, `direction`, `speed`
- `update()` — advances position, wraps around the board edge
- `getBounds()` — returns left/right pixel bounds for collision checks

## States and state transitions

```
splash --(Start clicked)--> playing
playing --(reach top row)--> gameover (win)
playing --(lives reach 0)--> gameover (lose)
gameover --(Play again clicked)--> playing
```

## Task

In priority order (mirrors the Trello board):

1. Create GitHub repo + clone locally
2. Write README skeleton
3. Build static HTML structure (3 state containers)
4. Style board grid + lanes + frog + stats bar (CSS only)
5. Implement frog grid movement (keyboard + on-screen buttons)
6. Implement single-lane car animation loop
7. Implement collision detection for one lane
8. Deploy to GitHub Pages (early, not last)
9. Add remaining 3-4 lanes with varied speed/direction
10. Add lives counter + reset-on-hit logic
11. Add win condition + win overlay
12. Add game-over overlay + restart button
13. Refactor for KISS/DRY
14. Bonus: sound effects
15. Bonus: localStorage high score
16. Write ai-usage.md log
17. Write retrospective notes
18. Build presentation slides
19. Final QA pass + code freeze
