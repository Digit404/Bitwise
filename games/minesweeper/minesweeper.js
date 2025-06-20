// game constants
const fieldWidth = 30;
const fieldHeight = 16;
const mineCount = 99;

// dom elements
const field = document.getElementById("field");
const mineCounter = document.getElementById("mine-count");
const hint = document.querySelector(".hint");
const modeToggle = document.getElementById("mode-toggle");
const messageContainer = document.getElementById("message-container");
const timer = document.getElementById("timer");

field.style.setProperty("--field-width", fieldWidth);

// game variables
let gameStarted = false;
let gameOver = false;
let flaggedCount = 0;
let detonationTimeouts = [];
let timerInterval = null;
let cheatCode = "";
let buddha = false;
let time = 0;

// sound effects
const failSound = new Audio("/res/sound/fail.wav");
failSound.volume = 0.5;
failSound.load();
const successSound = new Audio("/res/sound/ultimate.wav");
successSound.volume = 0.5;
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
        // first click starts the game
        if (!gameStarted) {
            this.startGame();
        }

        if (this.isFlagged || this.isFlipped) return;

        // flip the tile
        this.isFlipped = true;
        this.element.classList.add("flipped");

        // update the rounded borders
        Tile.runSurrounding(this.x, this.y, (tile) => {
            tile.updateBorder();
        });

        // if the tile is a mine, detonate it
        if (this.mineCount === 0 && !this.isMine) {
            Tile.runSurrounding(this.x, this.y, (tile) => {
                tile.flip();
            });
        }

        // check if the move won the game
        Tile.checkWin();
    }

    detonate() {
        // keep the flagged mines so that the player can see them
        if (this.isFlagged) return;

        field.classList.add("shaking");
        // play the boom sound
        const boomInterval = setInterval(() => {
            const boomSound = new Audio("/res/sound/pop_bang.wav");
            boomSound.volume = 0.5;
            boomSound.play();
        }, 50);

        // play the fail sound
        failSound.currentTime = 0;
        failSound.play();

        gameOver = true;

        // get the distance to each mine and detonate them with a delay, to create a chain reaction effect
        let maxDelay = 0;
        Tile.tiles.forEach((tile) => {
            if (tile.isMine) {
                const distance = Math.sqrt(Math.pow(tile.x - this.x, 2) + Math.pow(tile.y - this.y, 2));
                const delay = distance * 50;
                if (delay > maxDelay) maxDelay = delay;
                const id = setTimeout(() => {
                    tile.flip();
                }, delay);
                detonationTimeouts.push(id);
            }
        });

        // fail styles
        mineCounter.innerHTML = "RESTART";
        field.classList.add("fail");

        setTimeout(() => {
            field.classList.remove("shaking");
            clearInterval(boomInterval);
        }, maxDelay + 50);
    }

    chord() {
        // flips all surrounding tiles if the tile is flipped and has the correct number of flags around it
        if (!this.isFlipped || this.isFlagged || this.isMine) return;
        let count = 0;

        // count the number of flagged tiles around this tile
        for (let j = this.y - 1; j <= this.y + 1; j++) {
            for (let i = this.x - 1; i <= this.x + 1; i++) {
                const tile = Tile.getTile(i, j);
                // count tiles that are flagged or mines that are flipped for buddha mode
                if ((tile && tile.isFlagged) || (tile && tile.isMine && tile.isFlipped)) {
                    count++;
                }
            }
        }

        // if the number of flagged tiles matches the mine count, flip all surrounding tiles
        if (count === this.mineCount) {
            Tile.runSurrounding(this.x, this.y, (tile) => {
                if (!tile.isFlipped && !tile.isFlagged) {
                    // this can still end the game if a flag is misplaced
                    if (tile.isMine && !buddha) {
                        tile.detonate();
                    } else {
                        tile.flip();
                    }
                }
            });
        }
    }

    flag() {
        // toggle the flag on the tile
        if (this.isFlipped || gameOver || !gameStarted) return;
        if (flaggedCount >= mineCount && !this.isFlagged) return;

        this.isFlagged = !this.isFlagged;
        this.element.classList.toggle("flagged", this.isFlagged);

        // keep track of the number of flagged tiles
        if (this.isFlagged) {
            flaggedCount++;
        } else {
            flaggedCount--;
        }

        // update the mine counter
        mineCounter.innerHTML = mineCount - flaggedCount;

        Tile.runSurrounding(this.x, this.y, (tile) => {
            tile.updateBorder();
        });
    }

    click() {
        if (gameOver) return;
        if (this.isFlipped) {
            this.chord();
        } else if (modeToggle.checked) {
            this.flag();
        } else if (this.isMine && !buddha) {
            this.detonate();
        } else {
            this.flip();
        }
    }

    createTileElement() {
        const tileElement = document.createElement("div");
        tileElement.classList.add("tile");

        // add event listeners
        tileElement.addEventListener("click", () => {
            this.click();
        });

        tileElement.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            this.flag();
        });

        // make sure the field cannot be right-clicked
        field.addEventListener("contextmenu", (e) => {
            e.preventDefault();
        });

        this.element = tileElement;
        return tileElement;
    }

    updateBorder() {
        // get tile neighbors
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
            return tiles.every((tile) => tile && !(tile.isFlipped && !tile.isMine));
        }

        if (!this.isFlipped || this.isMine || this.isFlagged) {
            // for covered tiles
            this.element.classList.toggle("round-top-left", isFg(top, left));
            this.element.classList.toggle("round-top-right", isFg(top, right));
            this.element.classList.toggle("round-bottom-left", isFg(bottom, left));
            this.element.classList.toggle("round-bottom-right", isFg(bottom, right));
        } else {
            // for uncovered tiles
            this.element.classList.toggle("round-top-left", isBg(top, left, topLeft));
            this.element.classList.toggle("round-top-right", isBg(top, right, topRight));
            this.element.classList.toggle("round-bottom-left", isBg(bottom, left, bottomLeft));
            this.element.classList.toggle("round-bottom-right", isBg(bottom, right, bottomRight));
        }
    }

    startGame() {
        gameStarted = true;
        // fill after the first click so that the clicked tile is always 0
        Tile.fill(this);
        Tile.updateAllBorders();
        hint.classList.add("hidden");
        startTimer();
    }

    // get a tile by its coordinates
    static getTile(x, y) {
        if (x < 0 || x >= fieldWidth || y < 0 || y >= fieldHeight) return null;
        return Tile.tiles[y * fieldWidth + x];
    }

    // rebuild the game
    static reset() {
        // reset dom
        Tile.tiles = [];
        field.innerHTML = "";
        Tile.buildField(fieldWidth, fieldHeight);
        hint.classList.remove("hidden");
        field.classList = "";
        buddha = false;
        timer.innerHTML = "00:00.0";
        clearInterval(timerInterval);

        // reset game variables
        gameStarted = false;
        gameOver = false;
        flaggedCount = 0;

        // kill the detonation animation
        for (let timeout of detonationTimeouts) {
            clearTimeout(timeout);
        }
    }

    static lazarus() {
        // revive player
        gameOver = false;
        gameStarted = true;

        field.classList.remove("fail");
        mineCounter.innerHTML = mineCount - flaggedCount;

        for (let timeout of detonationTimeouts) {
            clearTimeout(timeout);
        }

        let oldTime = time;
        startTimer();
        time = oldTime + 345_600_000; // add 4 days to the timer

        for (let tile of Tile.tiles) {
            if (tile.isMine) {
                tile.element.classList.remove("flipped");
                tile.isFlipped = false;
            }
        }
    }

    // helper function to run a function on all surrounding tiles
    static runSurrounding(x, y, func) {
        for (let j = y - 1; j <= y + 1; j++) {
            for (let i = x - 1; i <= x + 1; i++) {
                const tile = Tile.getTile(i, j);
                if (tile) func(tile);
            }
        }
    }

    static checkWin() {
        // check if all tiles are flipped or flagged mines
        if (Tile.tiles.every((tile) => tile.isFlipped || tile.isMine)) {
            // play the success sound
            successSound.currentTime = 0;
            successSound.play();

            gameOver = true;
            mineCounter.innerHTML = "YOU WIN!";
            field.classList.add("success");

            // mark all mines as flagged
            Tile.tiles.forEach((tile) => {
                if (tile.isMine && !tile.isFlagged) {
                    tile.element.classList.add("flagged");
                }
            });
        }
    }

    static fill(safeTile = null) {
        // reset all tiles, in case it wasn't already
        Tile.tiles.forEach((tile) => {
            tile.mineCount = 0;
            tile.isMine = false;
            tile.isFlipped = false;
            tile.isFlagged = false;
            tile.element.classList = "tile";
        });

        // choose random placement for all mines
        for (let i = 0; i < mineCount; i++) {
            let x = Math.floor(Math.random() * fieldWidth);
            let y = Math.floor(Math.random() * fieldHeight);

            let tile = Tile.getTile(x, y);

            // make sure it's not too close to the safe tile
            const tooClose = safeTile && Math.abs(safeTile.x - x) <= 1 && Math.abs(safeTile.y - y) <= 1;

            if (tile.isMine || tooClose) {
                i--;
                continue;
            }

            // place mine
            tile.isMine = true;
            tile.element.classList = "tile mine";

            // increment the mine count of surrounding tiles
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
        // update the borders of all tiles
        Tile.tiles.forEach((tile) => {
            tile.updateBorder();
        });
    }

    static buildField(width, height) {
        // create the field and all the dom elements
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

function showMessage(message) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    messageDiv.innerHTML = message;
    messageContainer.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.classList.add("hide");
        messageDiv.addEventListener(
            "transitionend",
            () => {
                messageDiv.remove();
            },
            { once: true }
        );
    }, 3000);
}

function startTimer() {
    time = 0;
    timer.innerHTML = "00:00.0";

    timerInterval = setInterval(() => {
        if (gameOver) {
            clearInterval(timerInterval);
            return;
        }

        time += 100; // increment by 100ms

        let ms = time % 1000;
        let totalSeconds = Math.floor(time / 1000);

        let days = Math.floor(totalSeconds / 86400);
        let hours = Math.floor((totalSeconds % 86400) / 3600);
        let minutes = Math.floor((totalSeconds % 3600) / 60);
        let seconds = totalSeconds % 60;
        let milliseconds = Math.floor(ms / 100);

        let timeString = "";

        if (days > 0) {
            timeString += `${days}:`;
            timeString += `${hours.toString().padStart(2, "0")}:`;
        } else if (hours > 0) {
            timeString += `${hours}:`;
        }

        timeString += `${minutes.toString().padStart(2, "0")}:`;
        timeString += `${seconds.toString().padStart(2, "0")}.`;
        timeString += `${milliseconds}`;

        timer.innerHTML = timeString;
    }, 100);
}

addEventListener("keydown", (e) => {
    if (!gameOver) {
        // reset the game on enter
        if (e.code === "Enter") {
            Tile.reset();
            return;
        } else if (e.code === "Space") {
            // toggle the flag mode
            modeToggle.checked = !modeToggle.checked;
            modeToggle.dispatchEvent(new Event("change"));
            return;
        }
    }

    // handle cheat code
    cheatCode += e.key;
    if (cheatCode.endsWith("lazarus")) {
        if (!gameOver) return;

        Tile.lazarus();
        cheatCode = "";
        console.log("Lazarus cheat activated!");
        showMessage("Resurrection!");
    } else if (cheatCode.endsWith("odin")) {
        if (gameOver) return;
        field.classList.toggle("odin");
        field.classList.remove("horus");

        cheatCode = "";
        console.log("Odin cheat activated!");

        if (field.classList.contains("odin")) {
            showMessage("Odin's Wisdom Activated.");
        } else {
            showMessage("Odin's Wisdom Deactivated.");
        }
    } else if (cheatCode.endsWith("horus")) {
        if (gameOver) return;
        field.classList.toggle("horus");
        field.classList.remove("odin");

        cheatCode = "";
        console.log("Horus cheat activated!");

        if (field.classList.contains("horus")) {
            showMessage("Eye of Horus Activated.");
        } else {
            showMessage("Eye of Horus Deactivated.");
        }
    } else if (cheatCode.endsWith("buddha")) {
        buddha = !buddha;
        cheatCode = "";
        console.log("Buddha cheat activated!");
        if (buddha) {
            showMessage("Buddha's Blessing Activated.");
        } else {
            showMessage("Buddha's Blessing Deactivated.");
        }
    } else if (cheatCode.endsWith("xyzzy")) {
        field.classList.toggle("xyzzy");
        cheatCode = "";
    }
});
