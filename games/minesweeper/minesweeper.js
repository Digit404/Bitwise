print = console.log;

const fieldWidth = 30;
const fieldHeight = 16;
const tileSize = 16;
const scale = 2;

const fieldCanvas = document.getElementById("field");
const ctx = fieldCanvas.getContext("2d");

const tileSheet = new Image();

tileSheet.src = "https://www.bitwise.live/games/minesweeper/res/Minesweeper.png";
ctx.imageSmoothingEnabled = false;

let imageLoaded = false;
tileSheet.onload = function () {
    imageLoaded = true;
};

function loadImage() {
    if (imageLoaded) {
        // Retry after a short delay if the image hasn't finished loading yet
        setTimeout(loadImage, 50);
    }
    console.log('troublesome image loaded')
}

// Call the drawImage function to draw the image on the canvas
loadImage();

console.log(tileSheet.complete)

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