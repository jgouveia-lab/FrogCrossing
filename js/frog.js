// ================================================================
//  frog.js
//  Defines the Frog class. The frog knows how to:
//    - create its own <div> element and add it to the board
//    - track its position as a row + column on the grid
//    - move one step in a direction (up/down/left/right)
//    - render itself at the correct pixel position
//    - reset back to the starting position
// ================================================================

class Frog {
  constructor(board) {
    this.board    = board; // the <div id="board"> element
    this.cellSize = 60;    // each cell is 60×60 px
    this.size     = 50;    // the frog sprite is 50×50 px
    this.numRows  = 7;
    this.numCols  = 7;

    // Starting position: bottom row, middle column
    this.row = 6;
    this.col = 3;

    // Create the frog element and add it to the board
    this.el = document.createElement("div");
    this.el.id = "frog";
    this.board.appendChild(this.el);
  }

  // moveUp/Down/Left/Right each check the boundary before moving
  moveUp()    { if (this.row > 0)               this.row--; }
  moveDown()  { if (this.row < this.numRows - 1) this.row++; }
  moveLeft()  { if (this.col > 0)               this.col--; }
  moveRight() { if (this.col < this.numCols - 1) this.col++; }

  // reset() puts the frog back at the starting position
  reset() {
    this.row = 6;
    this.col = 3;
  }

  // render() converts row/col into pixels and moves the element
  render() {
    // (cellSize - size) / 2 = 5px — centers the 50px frog in the 60px cell
    const offset = (this.cellSize - this.size) / 2;

    this.el.style.left = (this.col * this.cellSize + offset) + "px";
    this.el.style.top  = (this.row * this.cellSize + offset) + "px";
  }

  // remove() cleans up when the game restarts
  remove() {
    this.el.remove();
  }
}
