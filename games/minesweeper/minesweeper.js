const fieldWidth = 30;
const fieldHeight = 16;
const tileSize = 16;
const scale = 2;

const fieldCanvas = document.getElementById("field");
const ctx = fieldCanvas.getContext("2d");

const tileSheet = new Image();

tileSheet.src = "./res/Minesweeper.png?";

ctx.drawImage(tileSheet, 16, 0, tileSize, tileSize, 0, 0, tileSize * scale, tileSize * scale);

/*
I'm thinking use objects for each tile
tiles have certain attributes, and stored in a matrix
attributes:
    isFlipped, 
    mineCount, // 0-8 -1 is a mine
    tileSprite, 
    x, 
    y
methods:
    flip()
    draw()
class methods:
    generate()
    drawField()
*/

class tile {
    constructor(mineCount, x, y) {
        this.isFlipped = false;
        this.mineCount = mineCount;
        this.x = x;
        this.y = y;
    }
}