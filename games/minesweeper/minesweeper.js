const fieldWidth = 30;
const fieldHeight = 16;
const tileSize = 64;
const scale = .75;
const mineCount = 100;

const fieldCanvas = document.getElementById("field");

const mineCounter = document.querySelector("#mine-count");

fieldCanvas.width = fieldWidth * tileSize * scale;
fieldCanvas.height = fieldHeight * tileSize * scale;

const ctx = fieldCanvas.getContext("2d");

const tileSheet = new Image();

const newGameButton = document.querySelector("#newGame");

tileSheet.src = "./res/minesweeper.png";

let firstClick;
let flaggedCount = 0;

class Tile {
    static tiles = [];

    constructor(mineCount, x, y) {
        this.isFlipped = false;
        this.isFlagged = false;
        this.mineCount = mineCount;
        this.x = x;
        this.y = y;
        Tile.tiles[y].push(this);
    }

    draw() {
        console.log("drawing ", this, " with ", this.getTileCoords());
        ctx.drawImage(
            tileSheet, // source image
            this.getTileCoords().x, // crop x
            this.getTileCoords().y, // crop y
            tileSize, // crop size x
            tileSize, // crop size y
            this.x * tileSize * scale, // position x
            this.y * tileSize * scale, // position y
            tileSize * scale, // scale x
            tileSize * scale // scale y
        );
    }

    static drawField() {
        for (let row of Tile.tiles) {
            for (let tile of row) {
                tile.draw();
            }
        }
    }

    getTileCoords() {
        let x, y;
        if (this.isFlagged) {
            x = 4;
            y = 1;
        } else if (!this.isFlipped) {
            x = 3;
            y = 1;
        } else if (this.mineCount === -1) {
            x = 5;
            y = 1;
        } else {
            x = this.mineCount % 6;
            y = Math.floor(this.mineCount / 6);
        }

        x *= tileSize;
        y *= tileSize;
        return { x, y };
    }

    static initialize() {
        firstClick = true;
        for (let j = 0; j < fieldHeight; j++) {
            Tile.tiles.push([]);
            for (let i = 0; i < fieldWidth; i++) {
                new Tile(0, i, j);
            }
        }
        Tile.drawField();
    }

    static fill() {
        for (let row of Tile.tiles) for (let tile of row) tile.mineCount = 0;
        for (let i = 0; i < mineCount; i++) {
            let x = Math.floor(Math.random() * fieldWidth);
            let y = Math.floor(Math.random() * fieldHeight);

            let tile = Tile.tiles[y][x];

            if (tile.mineCount === -1) {
                i--;
                continue;
            }

            tile.mineCount = -1;

            this.runSurrounding(x, y, (nextTile) => {
                if (nextTile.mineCount !== -1) {
                    nextTile.mineCount++;
                }
            });
        }
    }

    static runSurrounding(x, y, func) {
        for (let j = y - 1; j <= y + 1; j++) {
            for (let i = x - 1; i <= x + 1; i++) {
                // Check if the indices are within the valid range
                if (
                    j >= 0 &&
                    j < Tile.tiles.length &&
                    i >= 0 &&
                    i < Tile.tiles[j].length
                ) {
                    let tile = Tile.tiles[j][i];
                    func(tile);
                }
            }
        }
    }

    flip() {
        if (!this.isFlipped && !this.isFlagged) {
            this.isFlipped = true;
            this.draw();
            console.log(this.mineCount);
            if (this.mineCount === 0) {
                Tile.runSurrounding(this.x, this.y, (tile) => {
                    tile.flip();
                });
            } else if (this.mineCount === -1) {
                mineCounter.innerHTML = "YOU LOSE"
            }
        }
    }

    click() {
        if (!this.isFlipped) {
            this.flip();
        } else {
            this.chord();
        }
    }

    chord() {
        let count = 0;
        for (let j = this.y - 1; j <= this.y + 1; j++) {
            for (let i = this.x - 1; i <= this.x + 1; i++) {
                // Check if the indices are within the valid range
                if (
                    j >= 0 &&
                    j < Tile.tiles.length &&
                    i >= 0 &&
                    i < Tile.tiles[j].length
                ) {
                    let tile = Tile.tiles[j][i];
                    if (tile.isFlagged) {
                        count++;
                    }
                }
            }
        }

        if (count === this.mineCount) {
            Tile.runSurrounding(this.x, this.y, (tile) => {
                tile.flip();
            });
        }
    }

    flag() {
        if (!this.isFlipped) {
            if (this.isFlagged) {
                this.isFlagged = false;
                flaggedCount--;
            } else if (!this.isFlagged) {
                this.isFlagged = true;
                flaggedCount++;
            }
        }
        mineCounter.innerHTML = mineCount - flaggedCount
        this.draw();
    }
}

tileSheet.onload = function () {
    Tile.initialize({ x: fieldWidth, y: fieldHeight });
};

function getTile(x, y) {
    const rect = fieldCanvas.getBoundingClientRect();

    // Calculate the relative X and Y coordinates inside the canvas
    const xRelative = x - rect.left;
    const yRelative = y - rect.top;

    // Calculate the tile indices based on the relative coordinates
    const xTileIndex = Math.floor(xRelative / (tileSize * scale));
    const yTileIndex = Math.floor(yRelative / (tileSize * scale));

    // Access the tile and do your desired actions (assuming Tile is a 2D array)
    return Tile.tiles[yTileIndex][xTileIndex];
}

fieldCanvas.addEventListener("click", (e) => {
    let tile = getTile(e.clientX, e.clientY);

    if (firstClick) {
        do {
            Tile.fill();
        } while (tile.mineCount !== 0);
        firstClick = false;
    }

    tile.click();
});

fieldCanvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    let tile = getTile(e.clientX, e.clientY);

    tile.flag();
});

newGameButton.addEventListener("click", function () {
    Tile.initialize({ x: fieldWidth, y: fieldHeight });
});
