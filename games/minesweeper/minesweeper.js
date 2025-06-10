const fieldWidth = 30;
const fieldHeight = 16;
const mineCount = 100;

const field = document.getElementById("field");
const mineCounter = document.getElementById("mine-count");
const hint = document.querySelector(".hint");

field.style.setProperty("--field-width", fieldWidth);

let gameStarted = false;
let gameOver = false;
let flaggedCount = 0;
let detonationTimeouts = [];

class Tile {
    static tiles = [];

    constructor(x, y) {
        this.isFlipped = false;
        this.isFlagged = false;
        this.isMine = false;
        this.x = x;
        this.y = y;
        this.mineCount = 0;
    }

    flip() {
        if (!gameStarted) {
            gameStarted = true;
            Tile.fill(this);
            Tile.updateAllBorders();
            hint.classList.add("hidden");
        }

        if (this.isFlagged || this.isFlipped) return;

        this.isFlipped = true;
        this.element.classList.add("flipped");
        Tile.runSurrounding(this.x, this.y, (tile) => {
            tile.updateBorder();
        });

        if (this.mineCount === 0 && !this.isMine) {
            Tile.runSurrounding(this.x, this.y, (tile) => {
                tile.flip();
            });
        }
    }

    detonate() {
        if (this.isFlagged) return;
        gameOver = true;
        Tile.tiles.forEach((row) => {
            row.forEach((tile) => {
                if (tile.isMine) {
                    const distance = Math.sqrt(Math.pow(tile.x - this.x, 2) + Math.pow(tile.y - this.y, 2));
                    const id = setTimeout(() => {
                        tile.flip();
                    }, distance * 100);
                    detonationTimeouts.push(id);
                }
            });
        });

        mineCounter.innerHTML = "RESTART";
    }

    chord() {
        if (!this.isFlipped || this.isFlagged || this.isMine) return;
        let count = 0;
        for (let j = this.y - 1; j <= this.y + 1; j++) {
            for (let i = this.x - 1; i <= this.x + 1; i++) {
                // Check if the indices are within the valid range
                if (j >= 0 && j < Tile.tiles.length && i >= 0 && i < Tile.tiles[j].length) {
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
        if (this.isFlipped) return;

        this.isFlagged = !this.isFlagged;
        this.element.classList.toggle("flagged", this.isFlagged);

        if (this.isFlagged) {
            flaggedCount++;
        } else {
            flaggedCount--;
        }

        mineCounter.innerHTML = mineCount - flaggedCount;

        Tile.runSurrounding(this.x, this.y, (tile) => {
            tile.updateBorder();
        });
    }

    click() {
        if (gameOver) return;
        if (this.isFlipped) {
            this.chord();
        } else if (this.isMine) {
            this.detonate();
        } else {
            this.flip();
        }
    }

    createTileElement() {
        const tileElement = document.createElement("div");
        tileElement.classList.add("tile");

        tileElement.addEventListener("click", (e) => {
            this.click();
        });

        tileElement.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            this.flag();
        });

        this.element = tileElement;
        return tileElement;
    }

    updateBorder() {
        const top = Tile.tiles[this.y - 1]?.[this.x];
        const left = Tile.tiles[this.y]?.[this.x - 1];
        const bottom = Tile.tiles[this.y + 1]?.[this.x];
        const right = Tile.tiles[this.y]?.[this.x + 1];

        const topLeft = Tile.tiles[this.y - 1]?.[this.x - 1];
        const topRight = Tile.tiles[this.y - 1]?.[this.x + 1];
        const bottomLeft = Tile.tiles[this.y + 1]?.[this.x - 1];
        const bottomRight = Tile.tiles[this.y + 1]?.[this.x + 1];

        function isFg(...tiles) {
            return tiles.every((tile) => tile && tile.isFlipped && !tile.isMine && !tile.isFlagged);
        }

        function isBg(...tiles) {
            return tiles.every((tile) => tile && !tile.isFlipped && !tile.isFlagged);
        }

        if (!this.isFlipped || this.isMine || this.isFlagged) {
            this.element.classList.toggle("round-top-left", isFg(top, left));
            this.element.classList.toggle("round-top-right", isFg(top, right));
            this.element.classList.toggle("round-bottom-left", isFg(bottom, left));
            this.element.classList.toggle("round-bottom-right", isFg(bottom, right));
        } else {
            this.element.classList.toggle("round-top-left", isBg(top, left, topLeft));
            this.element.classList.toggle("round-top-right", isBg(top, right, topRight));
            this.element.classList.toggle("round-bottom-left", isBg(bottom, left, bottomLeft));
            this.element.classList.toggle("round-bottom-right", isBg(bottom, right, bottomRight));
        }
    }

    static reset() {
        Tile.tiles = [];
        field.innerHTML = "";
        Tile.buildField(fieldWidth, fieldHeight);
        hint.classList.remove("hidden");
        gameStarted = false;
        gameOver = false;
        flaggedCount = 0;
        for (let timeout of detonationTimeouts) {
            clearTimeout(timeout);
        }
    }

    static runSurrounding(x, y, func) {
        for (let j = y - 1; j <= y + 1; j++) {
            for (let i = x - 1; i <= x + 1; i++) {
                // Check if the indices are within the valid range
                if (j >= 0 && j < Tile.tiles.length && i >= 0 && i < Tile.tiles[j].length) {
                    let tile = Tile.tiles[j][i];
                    func(tile);
                }
            }
        }
    }

    static fill(safeTile = null) {
        for (let row of Tile.tiles) {
            for (let tile of row) {
                tile.mineCount = 0;
                tile.isMine = false;
                tile.isFlipped = false;
                tile.isFlagged = false;
                tile.element.classList = "tile";
            }
        }

        for (let i = 0; i < mineCount; i++) {
            let x = Math.floor(Math.random() * fieldWidth);
            let y = Math.floor(Math.random() * fieldHeight);

            let tile = Tile.tiles[y][x];

            const tooClose = safeTile && Math.abs(safeTile.x - x) <= 1 && Math.abs(safeTile.y - y) <= 1;

            if (tile.isMine || tooClose) {
                i--;
                continue;
            }

            tile.isMine = true;
            tile.element.classList = "tile mine";

            this.runSurrounding(x, y, (nextTile) => {
                if (!nextTile.isMine) {
                    nextTile.mineCount++;
                    nextTile.element.classList = "tile mine-count-" + nextTile.mineCount;
                }
            });
        }

        Tile.updateAllBorders();
    }

    static updateAllBorders() {
        Tile.tiles.forEach((row) => {
            row.forEach((tile) => {
                tile.updateBorder();
            });
        });
    }

    static buildField(width, height) {
        for (let i = 0; i < height; i++) {
            Tile.tiles[i] = [];
            const row = document.createElement("div");
            row.classList.add("tile-row");
            for (let j = 0; j < width; j++) {
                const tile = new Tile(j, i);
                const tileElement = tile.createTileElement();
                row.appendChild(tileElement);
                Tile.tiles[i].push(tile);
            }
            field.appendChild(row);
        }

        Tile.updateAllBorders();
        mineCounter.innerHTML = mineCount;
    }
}

Tile.buildField(fieldWidth, fieldHeight);

mineCounter.addEventListener("click", () => {
    Tile.reset();
});
