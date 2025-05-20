const outputBox = document.getElementById("outbox");

// wordbank
const inputBox = document.getElementById("input-box");
const selectBanks = document.getElementById("banks");

// length selector
const lengthBox = document.getElementById("length-box");
const lengthSlider = document.getElementById("length-slider");

const outLength = document.getElementById("out-length");
const copyButton = document.getElementById("copy-button");

class Wordbank {
    static banks = [];

    constructor(words, buttonID) {
        this.words = words;
        this.isActive = false;

        // add button to
        this.button = document.createElement("p");
        this.button.className = "bank-button";
        this.button.innerText = buttonID;
        this.button.onclick = this.toggle.bind(this);
        selectBanks.appendChild(this.button);

        Wordbank.banks.push(this);
    }

    /**
     * Toggles wordbank
     */
    toggle() {
        this.isActive = !this.isActive;
        this.button.classList.toggle("active");
        updateInputBox();
    }

    /**
     * All the words of all the wordbanks selected
     * @returns {Array} An array of all the words
     */
    static allWords() {
        let words = [];
        for (let bank of Wordbank.banks) {
            if (bank.isActive) {
                words.push(...bank.words);
            }
        }
        return words;
    }

    /**
     * Pulls a random word from the active wordbanks
     * @returns {String} A random word from the active wordbanks
     */
    static pullRandom() {
        return Wordbank.allWords()[randomInt(0, Wordbank.allWords().length)];
    }

    /**
     * Enables all banks, unless all banks are inactive then it disables all
     */
    static enableAll() {
        if (Wordbank.banks.every((bank) => bank.isActive)) {
            Wordbank.banks.forEach((bank) => bank.toggle());
        } else {
            for (let bank of Wordbank.banks) {
                if (!bank.isActive) {
                    bank.toggle();
                }
            }
        }
    }
}

// alert template
class alertMessage {
    static container = document.getElementById("popup");
    static actionButton = document.getElementById("popup-action");
    static hideButton = document.getElementById("popup-close");
    static title = document.getElementById("popup-title");
    static body = document.getElementById("popup-text");

    constructor(titleText, bodyText, hasButton, buttonAction) {
        // the title of the alert
        this.titleText = titleText;

        // the body of the alert
        this.bodyText = bodyText;

        // if it has an action button
        this.hasButton = hasButton;

        if (this.hasButton) {
            // the action of the action button
            this.buttonAction = buttonAction;

            // the text of the action button
            this.buttonText = "YES";
            this.hideText = "NO";
        } else {
            this.hideText = "OK";
        }
    }

    show() {
        // set text
        alertMessage.title.innerText = this.titleText;
        alertMessage.body.innerText = this.bodyText;
        alertMessage.hideButton.innerText = this.hideText;

        if (this.hasButton) {
            alertMessage.actionButton.hidden = false;
            alertMessage.actionButton.innerText = this.buttonText;
            alertMessage.actionButton.onclick = this.buttonAction;
        } else {
            alertMessage.actionButton.hidden = true;
        }

        // show popup
        alertMessage.container.classList.remove("hidden");
    }

    static hide() {
        alertMessage.container.classList.add("hidden");
    }
}

// alert messages

// used if user tries to replace what's in the box
const replaceAlert = new alertMessage("WAIT!", "The box has been edited. Replace what's there?", true);
// used if user tries to generate a password with nothing in the box
const emptyAlert = new alertMessage("OOPS!", "Word bank empty!");
// used if program fails to generate a password of target length
const lengthAlert = new alertMessage("SORRY!", "We couldn't find a combination of words that met the length requirements. Try more words or a different target length");

// wordbanks
const elements = new Wordbank(
    [
        "hydrogen",
        "helium",
        "lithium",
        "beryllium",
        "boron",
        "carbon",
        "nitrogen",
        "oxygen",
        "fluorine",
        "neon",
        "sodium",
        "magnesium",
        "aluminum",
        "silicon",
        "phosphorus",
        "sulfur",
        "chlorine",
        "argon",
        "potassium",
        "calcium",
        "scandium",
        "titanium",
        "vanadium",
        "chromium",
        "manganese",
        "cobalt",
        "nickel",
        "copper",
        "zinc",
        "gallium",
        "germanium",
        "arsenic",
        "selenium",
        "bromine",
        "krypton",
        "cadmium",
        "iodine",
        "xenon",
        "tungsten",
        "osmium",
        "iridium",
        "mercury",
        "thallium",
        "bismuth",
        "polonium",
        "radon",
        "radium",
        "thorium",
        "uranium",
        "neptunium",
        "plutonium",
        "americium",
    ],
    "Elements"
);

const moons = new Wordbank(
    [
        "luna",
        "phobos",
        "deimos",
        "europa",
        "ganymede",
        "callisto",
        "mimas",
        "enceladus",
        "tethys",
        "dione",
        "rhea",
        "titan",
        "hyperion",
        "iapetus",
        "phoebe",
        "ariel",
        "umbriel",
        "oberon",
        "miranda",
        "triton",
        "nereid",
        "vanth",
        "charon",
    ],
    "Moons"
);

const mythology = new Wordbank(
    [
        "zeus",
        "jupiter",
        "juno",
        "poseidon",
        "neptune",
        "kronos",
        "saturn",
        "aphrodite",
        "venus",
        "pluto",
        "vulcan",
        "demeter",
        "apollo",
        "athena",
        "artemis",
        "ares",
        "mars",
        "hermes",
        "mercury",
        "gaia",
        "terra",
        "uranus",
        "aurora",
        "luna",
        "helios",
        "sol",
        "hercules",
        "odysseus",
        "ulysses",
        "atlas",
        "boreas",
        "castor",
        "chronos",
        "hermes",
        "kratos",
        "morpheus",
        "pollux",
        "tartarus",
    ],
    "Mythology"
);

const astrology = new Wordbank(["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces", "zodiac"], "Astrology");

const geography = new Wordbank(
    [
        "himalayas",
        "andes",
        "caucasus",
        "appalachia",
        "ural",
        "alpine",
        "apennines",
        "cascade",
        "sierra",
        "carpathian",
        "yellowstone",
        "sahara",
        "mohave",
        "everest",
        "amazon",
        "nile",
        "kilimanjaro",
        "taiga",
        "alaska",
        "yukon",
        "fuji",
        "etna",
        "sinai",
        "danube",
        "tundra",
        "siberia",
        "corsica",
        "sicily",
        "borneo",
        "tahiti",
        "caspian",
        "tigris",
        "euphrates",
        "crete",
        "rhine",
        "elbrus",
        "olympus",
        "negev",
        "gobi",
        "mississippi",
        "yosemite",
        "ibeza",
    ],
    "Geography"
);

const cities = new Wordbank(
    [
        "amsterdam",
        "cairo",
        "dublin",
        "florence",
        "geneva",
        "havana",
        "istanbul",
        "kyoto",
        "tokyo",
        "lisbon",
        "marrakech",
        "oslo",
        "paris",
        "quito",
        "rome",
        "vienna",
        "warsaw",
        "brussels",
        "detroit",
        "glasgow",
        "moscow",
        "prague",
        "quebec",
        "budapest",
        "copenhagen",
        "denver",
        "hiroshima",
        "jerusalem",
        "munich",
        "orlando",
        "perth",
        "vancouver",
        "toronto",
        "odessa",
        "brisbane",
        "lubbock",
        "houston",
        "austin",
        "boston",
        "jericho",
        "laredo",
        "cleveland",
        "philadelphia",
        "nashville",
        "oxford",
        "albuquerque",
        "seoul",
        "berlin",
    ],
    "Cities"
);

// elements start on
elements.toggle();

// some wildcard characters to spice up the password
const wildcards = ["!", "@", "#", "$", "%", "^", "&", "*", "?", "+"];

/**
 * Generates a random integer in range (Inclusive)
 * @param {Number} min Minimum number (Inclusive)
 * @param {Number} max Maximum number (Inclusive)
 * @returns {number} Random integer
 */
function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * @returns {String} A random word from the wordbank
 */
function randWord() {
    let words = inputBox.value.split(/\,\s|\,/);
    return words[randomInt(0, words.length - 1)];
}

/**
 * @returns A random digit between 0 and 9
 */
function randomDigit() {
    return Math.floor(Math.random() * 10);
}

/**
 * Spins a weighted wheel and returns the success
 * @param {Number} chance The probability of success
 * @param {Number} sides The number of sections of the wheel
 * @returns {boolean} The success of the spin
 */
function spin(chance, sides) {
    return chance >= randomInt(1, sides) ? true : false;
}

/**
 * Takes a string and randomizes it's capitalization
 * @param {String} string A string to randomize
 * @returns {String} The randomized string
 */
function charReplace(string) {
    if (string.length === 0) {
        return ""; // base case
    }
    if (string.slice(-1) === "o" && spin(2, 3)) {
        return charReplace(string.slice(0, -1)) + "0";
    } else if (string.slice(-1) === "i" && spin(2, 3)) {
        return charReplace(string.slice(0, -1)) + "1";
    } else {
        return charReplace(string.slice(0, -1)) + (spin(1, 2) ? string.slice(-1).toLowerCase() : string.slice(-1).toUpperCase());
    }
}

/**
 * Generates the password. Pulls random word from bank, randomizes the capitalization, adds numbers and a symbol.
 */
function generate() {
    // Lets the user know the length of the generated password

    // set to target length - 3 to leave room for numbers and wildcard
    let length = lengthBox.value - 3;

    // init generated password
    let genPass = "";

    // if wordbank is empty
    if (randWord() === "") {
        emptyAlert.show();
        return;
    }

    // try to get a word that's within the length 255 times
    for (let i = 0; i < 256; i++) {
        // pull random word from word bank
        genPass += randWord();

        // if it meets requirements, within 2 of the target length
        if (Math.abs(genPass.length - length) <= 2) {
            break;
        }

        // if it is too long and you haven't tried 255 times, start over
        if (genPass.length > length + 2 && i < 255) {
            genPass = "";
        }

        // if you have tried 255 times show an alert
        if (i >= 255) {
            lengthAlert.show();
        }
    }

    // set back to target length
    length = lengthBox.value;

    // try to replace the word with random numbers and capitalization, give up after 16 tries
    for (let i = 0; i < 16; i++) {
        // if you tried 16 times, just generate a new word
        if (i >= 15) {
            generate();
            break;
        }
        // if the word is all caps or all lower case
        if (genPass === genPass.toLowerCase() || genPass === genPass.toUpperCase()) {
            // randomize word
            genPass = charReplace(genPass);
        } else {
            break;
        }
    }

    // add two numbers to the end
    genPass = genPass + randomDigit() + randomDigit();

    // if it's too small add numbers until it's long enough
    while (genPass.length < length - 1) {
        genPass += randomDigit();
    }

    // add a wildcard
    genPass += wildcards[randomInt(0, wildcards.length - 1)];

    // update length indicator
    outLength.innerText = genPass.length;

    // output password
    outputBox.value = genPass;
}

function updateInputBox() {
    inputBox.value = Wordbank.allWords().join(", ");
}

/**
 * Copy function for copying the text to clipboard
 */
function copy() {
    navigator.clipboard.writeText(outputBox.value);
    copyButton.innerText = "check";
    copyButton.classList.add("green");

    setTimeout(function () {
        copyButton.innerText = "content_copy";
        copyButton.classList.remove("green");
    }, 2000); // Change the text back to "COPY" after 3000 milliseconds (3 second)
}

window.copy = copy;

// Listeners

// Listens to length slider and keeps the number box updated
lengthSlider.addEventListener("input", function () {
    lengthBox.value = lengthSlider.value;
});

// listens to box and keeps it below 64
lengthBox.addEventListener("change", function () {
    if (lengthBox.value >= 64) {
        lengthBox.value = 64;
    }
});
