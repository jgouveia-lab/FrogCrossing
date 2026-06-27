// ================================================================
//  car.js
//  Defines the Car class. Each car knows how to:
//    - create its own <div> element and add it to the board
//    - move itself every game tick
//    - wrap around when it goes off the edge of the board
//    - remove itself from the board when no longer needed
// ================================================================

class Car {
  // The constructor runs once when we do "new Car(...)"
  // It receives all the info it needs to set itself up.
  constructor(board, row, startX, speed, width) {
    this.board  = board;   // the <div id="board"> element — cars live inside it
    this.row    = row;     // which lane row this car drives in (1–5)
    this.x      = startX; // starting horizontal position in pixels
    this.speed  = speed;  // pixels per tick (positive = right, negative = left)
    this.width  = width;  // how wide this car is in pixels

    // Constants shared by all cars
    this.height   = 36;
    this.cellSize = 60; // each row is 60px tall

    // Create the DOM element for this car
    this.el = document.createElement("div");
    this.el.classList.add("car");

    // Red for cars going right, orange for cars going left
    if (this.speed > 0) {
      this.el.classList.add("car-right");
    } else {
      this.el.classList.add("car-left");
    }

    // Set the width on the element (height is handled by CSS)
    this.el.style.width = this.width + "px";

    // Add the car element to the board
    this.board.appendChild(this.el);
  }

  // move() is called every game tick to advance the car
  move() {
    this.x += this.speed;

    const boardWidth = 420; // 7 columns × 60px

    // If going right and fully off the right edge → reappear on the left
    if (this.speed > 0 && this.x > boardWidth) {
      this.x = -this.width;
    }

    // If going left and fully off the left edge → reappear on the right
    if (this.speed < 0 && this.x + this.width < 0) {
      this.x = boardWidth;
    }
  }

  // render() applies the current x position to the element's CSS
  render() {
    // Center the car vertically inside its row
    const offsetY = (this.cellSize - this.height) / 2;

    this.el.style.left = this.x + "px";
    this.el.style.top  = (this.row * this.cellSize + offsetY) + "px";
  }

  // remove() cleans up the element when the game restarts
  remove() {
    this.el.remove();
  }
}
