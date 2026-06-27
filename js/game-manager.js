// ================================================================
//  game-manager.js
//  Defines the Game class. The Game is in charge of:
//    - building the board (lanes, frog, cars)
//    - running the game loop with requestAnimationFrame
//    - checking for collisions between the frog and cars
//    - tracking lives, crossings, level, and high score
//    - switching between screens (splash → game → gameover)
// ================================================================

class Game {
  constructor() {
    // Grab the elements we need to update during the game
    this.board            = document.getElementById("board");
    this.livesDisplay     = document.getElementById("lives");
    this.levelDisplay     = document.getElementById("level");
    this.crossingsDisplay = document.getElementById("crossings");
    this.highscoreDisplay = document.getElementById("highscore");
    this.resultTitle      = document.getElementById("result-title");
    this.resultDetail     = document.getElementById("result-detail");

    // Three screens — splash, game, gameover
    this.splashScreen   = document.getElementById("splash-screen");
    this.gameScreen     = document.getElementById("game-screen");
    this.gameoverScreen = document.getElementById("gameover-screen");

    // Game state — reset properly in start()
    this.lives     = 3;
    this.crossings = 0;
    this.level     = 1;
    this.loop      = null;  // requestAnimationFrame ID
    this.frogDead  = false; // true while the death animation is playing

    // How many crossings per level before moving up
    this.crossingsPerLevel = 5;

    // The fastest any car is allowed to go — prevents the game from
    // becoming impossible at very high levels.
    this.maxCarSpeed = 9;

    // High score — load from localStorage so it survives page reloads.
    this.highScore = parseInt(localStorage.getItem("frogHighLevel")) || 0;

    // The frog and cars are created fresh in start()
    this.frog = null;
    this.cars = [];

    // Sounds — created once, reused for every sound effect
    this.sounds = new Sounds();

    // Car blueprints: each object describes one car per lane.
    // Two cars sharing the same row will be spread apart in buildBoard()
    // so there is always a gap wide enough for the frog to cross.
    this.carBlueprints = [
      { row: 1, baseSpeed:  2.5, width: 75  },
      { row: 1, baseSpeed:  2.5, width: 75  },
      { row: 2, baseSpeed: -3,   width: 75  },
      { row: 2, baseSpeed: -3,   width: 75  },
      { row: 3, baseSpeed:  1.8, width: 105 }, // wider "bus"
      { row: 3, baseSpeed:  1.8, width: 75  },
      { row: 4, baseSpeed: -2,   width: 75  },
      { row: 4, baseSpeed: -2,   width: 75  },
      { row: 5, baseSpeed:  3.5, width: 75  },
    ];
  }

  // ---- showScreen ------------------------------------------
  // Hides all screens and shows the one passed in.
  showScreen(screenEl) {
    this.splashScreen.classList.remove("is-active");
    this.gameScreen.classList.remove("is-active");
    this.gameoverScreen.classList.remove("is-active");
    screenEl.classList.add("is-active");
  }

  // ---- updateStats -----------------------------------------
  updateStats() {
    const progressInLevel = this.crossings % this.crossingsPerLevel;

    this.livesDisplay.textContent     = "❤️ Lives: " + this.lives;
    this.levelDisplay.textContent     = "Level: " + this.level;
    this.crossingsDisplay.textContent =
      "⭐ " + progressInLevel + " / " + this.crossingsPerLevel + " — reach " + this.crossingsPerLevel + " to level up!";
    this.highscoreDisplay.textContent = "🏆 Best: Lv." + this.highScore;
  }

  // ---- saveHighScore ---------------------------------------
  saveHighScore() {
    if (this.level > this.highScore) {
      this.highScore = this.level;
      localStorage.setItem("frogHighLevel", this.highScore);
    }
  }

  // ---- buildBoard ------------------------------------------
  // Clears the board and creates all the visual elements.
  // GAP GUARANTEE: cars in the same lane are placed in separate
  // "slots" so there is always a passable gap between them.
  buildBoard() {
    this.board.innerHTML = "";

    const laneTypes = ["goal", "road", "road", "road", "road", "road", "start"];
    for (let i = 0; i < laneTypes.length; i++) {
      const lane = document.createElement("div");
      lane.classList.add("lane", laneTypes[i]);
      this.board.appendChild(lane);
    }

    this.frog = new Frog(this.board);
    this.frog.render();

    // Count how many cars belong to each row so we can divide the board
    // into equal slots — one slot per car — guaranteeing gaps between them.
    const carCountPerRow  = {};
    const slotIndexPerRow = {};
    for (let c = 0; c < this.carBlueprints.length; c++) {
      const row = this.carBlueprints[c].row;
      carCountPerRow[row]  = (carCountPerRow[row]  || 0) + 1;
      slotIndexPerRow[row] = 0; // will count up as we place each car
    }

    this.cars = [];
    for (let c = 0; c < this.carBlueprints.length; c++) {
      const bp  = this.carBlueprints[c];
      const row = bp.row;

      // Divide the 420px board into equal slots, one per car in this row.
      // Place the car randomly within its own slot so cars never bunch up.
      const totalCars = carCountPerRow[row];
      const slotIndex = slotIndexPerRow[row];
      slotIndexPerRow[row]++;

      const slotWidth  = 420 / totalCars;
      const maxOffset  = slotWidth - bp.width - 10; // keep car inside its slot
      const startX     = slotIndex * slotWidth + (maxOffset > 0 ? Math.random() * maxOffset : 0);

      // Speed variation ±25% — multiplying keeps the direction (sign) intact
      const variation = 0.75 + Math.random() * 0.5;
      const speed     = bp.baseSpeed * variation;

      const car = new Car(this.board, row, startX, speed, bp.width);
      car.render();
      this.cars.push(car);
    }
  }

  // ---- isHit -----------------------------------------------
  // Returns true if the frog overlaps with any car.
  isHit() {
    const margin = 8;

    const frogLeft  = this.frog.col * 60 + margin;
    const frogRight = this.frog.col * 60 + this.frog.size - margin;

    for (let i = 0; i < this.cars.length; i++) {
      const car = this.cars[i];

      if (car.row !== this.frog.row) continue;

      const carLeft  = car.x + margin;
      const carRight = car.x + car.width - margin;

      const noOverlap = frogRight < carLeft || frogLeft > carRight;
      if (!noOverlap) return true;
    }

    return false;
  }

  // ---- loseLife --------------------------------------------
  // Plays the death animation, shakes the board, then subtracts a life.
  loseLife() {
    if (this.frogDead) return;

    this.frogDead = true;
    this.sounds.playHit();

    // Flash the frog red
    this.frog.el.classList.add("dead");

    // SCREEN SHAKE: add the "shake" class to the board so it wobbles.
    // The CSS animation lasts 0.4s, then we remove the class.
    this.board.classList.add("shake");
    setTimeout(() => { this.board.classList.remove("shake"); }, 400);

    setTimeout(() => {
      this.frog.el.classList.remove("dead");
      this.frogDead = false;

      this.lives--;
      this.updateStats();

      if (this.lives <= 0) {
        this.sounds.stopMusic();
        this.sounds.playGameOver();
        this.saveHighScore();
        this.end();
      } else {
        this.frog.reset();
        this.frog.render();
      }
    }, 500);
  }

  // ---- spawnCelebration ------------------------------------
  spawnCelebration() {
    const goalLane = this.board.querySelector(".lane.goal");
    goalLane.classList.add("flash");
    setTimeout(function () { goalLane.classList.remove("flash"); }, 700);

    const emojis = ["⭐", "🌟", "✨", "🎉", "💚"];
    for (let i = 0; i < 7; i++) {
      const particle = document.createElement("div");
      particle.classList.add("particle");
      particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      particle.style.left = (Math.random() * 370 + 10) + "px";
      particle.style.top  = "5px";
      particle.style.animationDelay = (i * 60) + "ms";
      this.board.appendChild(particle);
      setTimeout(function (p) { p.remove(); }, 1900 + i * 60, particle);
    }
  }

  // ---- winCrossing -----------------------------------------
  // Called when the frog reaches the top row.
  // Every 5 crossings = level up: faster cars, extra life, banner.
  winCrossing() {
    this.crossings++;
    this.sounds.playCrossing();
    this.spawnCelebration();

    this.frog.reset();
    this.frog.render();

    if (this.crossings % this.crossingsPerLevel === 0) {
      this.level++;
      this.lives++;
      this.saveHighScore();

      // Speed up all cars by 20% — but never exceed maxCarSpeed.
      // Math.sign() returns 1 or -1 so we preserve the direction.
      for (let i = 0; i < this.cars.length; i++) {
        const newSpeed = this.cars[i].speed * 1.2;
        const cap      = this.maxCarSpeed * Math.sign(newSpeed);

        // If going right, cap at +maxCarSpeed. If going left, cap at -maxCarSpeed.
        if (Math.abs(newSpeed) > this.maxCarSpeed) {
          this.cars[i].speed = cap;
        } else {
          this.cars[i].speed = newSpeed;
        }
      }

      this.updateStats();
      this.showLevelUpBanner();
      this.showLifeGainPopup();
    } else {
      this.updateStats();
    }
  }

  // ---- showLevelUpBanner -----------------------------------
  showLevelUpBanner() {
    const banner = document.createElement("div");
    banner.classList.add("level-up-banner");
    banner.textContent = "LEVEL " + this.level + "! 🚀";
    this.board.appendChild(banner);
    setTimeout(function () { banner.remove(); }, 1700);
  }

  // ---- showLifeGainPopup -----------------------------------
  showLifeGainPopup() {
    const rect = this.livesDisplay.getBoundingClientRect();
    const popup = document.createElement("div");
    popup.classList.add("life-gain-popup");
    popup.textContent = "+1 ❤️";
    popup.style.left = rect.left + "px";
    popup.style.top  = rect.top  + "px";
    document.body.appendChild(popup);
    setTimeout(function () { popup.remove(); }, 1300);
  }

  // ---- tick ------------------------------------------------
  // The main game loop — called every frame by requestAnimationFrame.
  // Moves all cars, re-draws them, and checks for collisions.
  tick() {
    for (let i = 0; i < this.cars.length; i++) {
      this.cars[i].move();
      this.cars[i].render();
    }

    if (!this.frogDead && this.isHit()) {
      this.loseLife();
    }
  }

  // ---- start -----------------------------------------------
  // Resets everything and kicks off the game loop.
  start() {
    // Cancel any loop still running from a previous game.
    // requestAnimationFrame uses cancelAnimationFrame (not clearInterval).
    if (this.loop) cancelAnimationFrame(this.loop);

    this.lives     = 3;
    this.crossings = 0;
    this.level     = 1;
    this.frogDead  = false;

    this.sounds.stopMusic();
    this.sounds.startMusic();

    this.updateStats();
    this.buildBoard();
    this.showScreen(this.gameScreen);

    // requestAnimationFrame is the browser-standard way to run a game loop.
    // It syncs to the screen's refresh rate (~60fps), pauses automatically
    // when the tab is hidden, and is smoother than setInterval.
    //
    // We define a named function "step" so it can call itself recursively.
    // Each call draws one frame, then schedules the next one.
    const step = () => {
      this.tick();
      // Store the frame ID so we can cancel it in end()
      this.loop = requestAnimationFrame(step);
    };
    this.loop = requestAnimationFrame(step);
  }

  // ---- end -------------------------------------------------
  // Player ran out of lives — show the game over screen.
  end() {
    // cancelAnimationFrame stops the loop (equivalent of clearInterval before)
    cancelAnimationFrame(this.loop);
    this.loop = null;

    // Show level reached, total crossings, and whether they beat their best
    const isNewBest = this.level >= this.highScore;
    const bestLine  = isNewBest
      ? "🎉 New best: Level " + this.highScore + "!"
      : "🏆 Best: Level " + this.highScore;

    this.resultTitle.textContent  = "Game Over! 💀";
    this.resultDetail.textContent =
      "Level " + this.level + " · ⭐ " + this.crossings + " crossings · " + bestLine;

    this.showScreen(this.gameoverScreen);
  }

  // ---- handleKey -------------------------------------------
  // Called by the keydown listener in main.js.
  handleKey(event) {
    if (!this.loop || this.frogDead) return;

    let moved = false;

    if (event.key === "ArrowUp"    || event.key === "w") { this.frog.moveUp();    moved = true; }
    if (event.key === "ArrowDown"  || event.key === "s") { this.frog.moveDown();  moved = true; }
    if (event.key === "ArrowLeft"  || event.key === "a") { this.frog.moveLeft();  moved = true; }
    if (event.key === "ArrowRight" || event.key === "d") { this.frog.moveRight(); moved = true; }

    if (moved) {
      event.preventDefault();
      this.sounds.playHop();
      this.frog.render();

      if (this.frog.row === 0) {
        this.winCrossing();
        return;
      }

      if (this.isHit()) {
        this.loseLife();
      }
    }
  }

  // ---- moveFrog --------------------------------------------
  // Called by the on-screen d-pad buttons in main.js.
  moveFrog(direction) {
    if (!this.loop || this.frogDead) return;

    if (direction === "up")    this.frog.moveUp();
    if (direction === "down")  this.frog.moveDown();
    if (direction === "left")  this.frog.moveLeft();
    if (direction === "right") this.frog.moveRight();

    this.sounds.playHop();
    this.frog.render();

    if (this.frog.row === 0) { this.winCrossing(); return; }
    if (this.isHit())        { this.loseLife(); }
  }
}
