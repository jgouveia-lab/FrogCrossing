// ================================================================
//  main.js  —  entry point
//  This file just wires up buttons and keyboard events,
//  then delegates everything to the game-manager.js file.
// ================================================================

window.onload = function () {

  const startBtn     = document.getElementById("start-btn");
  const restartBtn   = document.getElementById("restart-btn");
  const playAgainBtn = document.getElementById("play-again-btn");
  const muteBtn      = document.getElementById("mute-btn");

  // D-pad buttons (on-screen controls for mouse / touch)
  const btnUp    = document.getElementById("btn-up");
  const btnDown  = document.getElementById("btn-down");
  const btnLeft  = document.getElementById("btn-left");
  const btnRight = document.getElementById("btn-right");

  // Show the player's best level on the splash screen if they have one
  const splashBest = document.getElementById("splash-best");
  const savedLevel = parseInt(localStorage.getItem("frogHighLevel")) || 0;
  if (savedLevel > 0) {
    splashBest.textContent = "🏆 Your best: Level " + savedLevel;
  }

  // ourGame is created once so we reuse the same AudioContext on restart.
  // Creating new Game() each restart would leak AudioContexts — browsers
  // cap them at ~6 and start warning. Calling .start() resets all state.
  const ourGame = new Game();

  // ---- Button listeners -------------------------------------
  startBtn.addEventListener("click",     function () { ourGame.start(); });
  restartBtn.addEventListener("click",   function () { ourGame.start(); });
  playAgainBtn.addEventListener("click", function () { ourGame.start(); });

  // Mute button: toggles sound on/off and updates the icon
  muteBtn.addEventListener("click", function () {
    const isMuted = ourGame.sounds.toggleMute();
    muteBtn.textContent = isMuted ? "🔇" : "🔊";
  });

  // ---- Keyboard listener ------------------------------------
  document.addEventListener("keydown", function (event) {
    ourGame.handleKey(event);
  });

  // ---- D-pad listeners --------------------------------------
  btnUp.addEventListener("click",    function () { ourGame.moveFrog("up");    });
  btnDown.addEventListener("click",  function () { ourGame.moveFrog("down");  });
  btnLeft.addEventListener("click",  function () { ourGame.moveFrog("left");  });
  btnRight.addEventListener("click", function () { ourGame.moveFrog("right"); });

};
