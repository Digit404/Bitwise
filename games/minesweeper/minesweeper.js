const fieldWidth = 30;
const fieldHeight = 16;
const mineCount = 99;

const field = document.getElementById("field");
const mineCounter = document.getElementById("mine-count");
const hint = document.querySelector(".hint");

field.style.setProperty("--field-width", fieldWidth);

let gameStarted = false;
let gameOver = false;
let flaggedCount = 0;
let detonationTimeouts = [];

const failSound = new Audio("/res/sound/fail.wav");
failSound.load();
const successSound = new Audio("/res/sound/ultimate.wav");
successSound.load();

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

        Tile.checkWin();
    }

    detonate() {
        if (this.isFlagged) return;
        failSound.currentTime = 0;
        failSound.play();
        gameOver = true;
        Tile.tiles.forEach((tile) => {
            if (tile.isMine) {
                const distance = Math.sqrt(Math.pow(tile.x - this.x, 2) + Math.pow(tile.y - this.y, 2));
                const id = setTimeout(() => {
                    tile.flip();
                }, distance * 50);
                detonationTimeouts.push(id);
            }
        });

        mineCounter.innerHTML = "RESTART";
        field.classList.add("fail");
    }

    chord() {
        if (!this.isFlipped || this.isFlagged || this.isMine) return;
        let count = 0;
        for (let j = this.y - 1; j <= this.y + 1; j++) {
            for (let i = this.x - 1; i <= this.x + 1; i++) {
                const tile = Tile.getTile(i, j);
                if (tile && tile.isFlagged) {
                    count++;
                }
            }
        }

        if (count === this.mineCount) {
            Tile.runSurrounding(this.x, this.y, (tile) => {
                if (!tile.isFlipped && !tile.isFlagged) {
                    if (tile.isMine) {
                        tile.detonate();
                    } else {
                        tile.flip();
                    }
                }
            });
        }
    }

    flag() {
        if (this.isFlipped || gameOver) return;

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

        field.addEventListener("contextmenu", (e) => {
            e.preventDefault();
        });

        this.element = tileElement;
        return tileElement;
    }

    updateBorder() {
        const top = Tile.getTile(this.x, this.y - 1);
        const left = Tile.getTile(this.x - 1, this.y);
        const bottom = Tile.getTile(this.x, this.y + 1);
        const right = Tile.getTile(this.x + 1, this.y);

        const topLeft = Tile.getTile(this.x - 1, this.y - 1);
        const topRight = Tile.getTile(this.x + 1, this.y - 1);
        const bottomLeft = Tile.getTile(this.x - 1, this.y + 1);
        const bottomRight = Tile.getTile(this.x + 1, this.y + 1);

        function isFg(...tiles) {
            return tiles.every((tile) => tile && tile.isFlipped && !tile.isMine);
        }

        function isBg(...tiles) {
            return tiles.every((tile) => tile && !tile.isFlipped);
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

    static getTile(x, y) {
        if (x < 0 || x >= fieldWidth || y < 0 || y >= fieldHeight) return null;
        return Tile.tiles[y * fieldWidth + x];
    }

    static reset() {
        Tile.tiles = [];
        field.innerHTML = "";
        Tile.buildField(fieldWidth, fieldHeight);
        hint.classList.remove("hidden");
        field.classList.remove("fail", "success");
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
                const tile = Tile.getTile(i, j);
                if (tile) func(tile);
            }
        }
    }

    static checkWin() {
        if (Tile.tiles.every((tile) => tile.isFlipped || tile.isMine)) {
            successSound.currentTime = 0;
            successSound.play();
            gameOver = true;
            mineCounter.innerHTML = "YOU WIN!";
            field.classList.add("success");
            Tile.tiles.forEach((tile) => {
                if (tile.isMine && !tile.isFlagged) {
                    tile.element.classList.add("flagged");
                }
            });
        }
    }

    static fill(safeTile = null) {
        Tile.tiles.forEach((tile) => {
            tile.mineCount = 0;
            tile.isMine = false;
            tile.isFlipped = false;
            tile.isFlagged = false;
            tile.element.classList = "tile";
        });

        for (let i = 0; i < mineCount; i++) {
            let x = Math.floor(Math.random() * fieldWidth);
            let y = Math.floor(Math.random() * fieldHeight);

            let tile = Tile.getTile(x, y);

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
        Tile.tiles.forEach((tile) => {
            tile.updateBorder();
        });
    }

    static buildField(width, height) {
        Tile.tiles = [];
        for (let y = 0; y < height; y++) {
            const row = document.createElement("div");
            row.classList.add("tile-row");
            for (let x = 0; x < width; x++) {
                const tile = new Tile(x, y);
                const tileElement = tile.createTileElement();
                row.appendChild(tileElement);
                Tile.tiles.push(tile);
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
