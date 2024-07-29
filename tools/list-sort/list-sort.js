// fit text to element by adjusting font size
function fitText(element) {
    let fontSize = 100;
    element.style.fontSize = fontSize + "px";
    while (
        element.scrollWidth > element.offsetWidth ||
        element.scrollHeight > element.offsetHeight
    ) {
        fontSize--;
        element.style.fontSize = fontSize + "px";
    }
}

// fit text on window resize
window.addEventListener("resize", () =>
    document.querySelectorAll(".choice-text").forEach(fitText)
);

// function to combine arrays during merge sort
async function merge(left, right, compare) {
    let result = [];
    let i = 0,
        j = 0;

    while (i < left.length && j < right.length) {
        // compare elements
        if ((await compare(left[i], right[j])) === left[i]) {
            result.push(left[i++]);
        } else {
            result.push(right[j++]);
        }
    }

    return result.concat(left.slice(i)).concat(right.slice(j));
}

// function to perform insertion sort
async function insertionSort(arr, compare) {
    for (let i = 1; i < arr.length; i++) {
        let key = arr[i];
        let j = i - 1;

        // compare and find position
        while (j >= 0 && (await compare(arr[j], key)) === key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }

    return arr;
}

// the main sorting function
async function mergeInsertionSort(arr, compare) {
    if (arr.length <= 10) {
        // use insertion sort for small arrays
        return await insertionSort(arr, compare);
    }

    const mid = Math.floor(arr.length / 2);
    const left = await mergeInsertionSort(arr.slice(0, mid), compare);
    const right = await mergeInsertionSort(arr.slice(mid), compare);

    return merge(left, right, compare);
}

// set superlative
let superlative = "best";
document.querySelector("#input-screen>.input").textContent = superlative;
document.querySelector("#comparison-screen>.title>.input").textContent =
    superlative;

let sorted = [];

// start button event listener
document
    .getElementById("start-button")
    .addEventListener("click", async function (e) {
        // get and process choices
        const choices = document
            .getElementById("choices-input")
            .value.split(/[\n,]+/)
            .map((choice) => choice.trim())
            .filter(
                (choice, index, self) =>
                    choice !== "" && self.indexOf(choice) === index
            );

        // require at least 2 unique choices
        if (choices.length < 2) {
            e.target.innerHTML = "Please enter at least 2 unique choices";
            e.target.classList.add("error");
            setTimeout(() => {
                e.target.classList.remove("error");
                e.target.innerHTML = "Start Comparison";
            }, 2000);
            return;
        }

        superlative = document.querySelector(
            "#input-screen>.input"
        ).textContent;
        document.querySelector("#comparison-screen>.title>.input").textContent =
            superlative;

        // switch to comparison screen
        document.getElementById("input-screen").style.display = "none";
        document.getElementById("comparison-screen").style.display = "block";

        sorted = await mergeInsertionSort(choices, presentChoice);

        buildResults(sorted);
    });

// function to build results list
function buildResults(sorted) {
    const resultsList = document.getElementById("results-list");
    resultsList.innerHTML = "";

    for (let item of sorted) {
        const li = document.createElement("li");
        const rank = document.createElement("span");
        rank.textContent = sorted.indexOf(item) + 1;
        rank.classList.add("rank");
        li.appendChild(rank);

        // create best badge for the best item
        if (item === sorted[0]) {
            const bestBadge = document.createElement("span");
            bestBadge.textContent = superlative;
            bestBadge.classList.add("best-badge");
            li.appendChild(bestBadge);
        }

        li.appendChild(document.createTextNode(item));
        resultsList.appendChild(li);
    }

    document.body.style.overflow = "auto";

    // switch to results screen
    document.getElementById("comparison-screen").style.display = "none";
    document.getElementById("results-screen").style.display = "block";
}

function presentChoice(a, b) {
    return new Promise((resolve) => {
        // update displayed choices
        document.querySelector("#choice-1 .choice-text").textContent = a;
        document.querySelector("#choice-2 .choice-text").textContent = b;
        document.querySelectorAll(".choice-text").forEach(fitText);
        // trigger appear animation
        const choiceElements = document.querySelectorAll(".choice");
        choiceElements.forEach((choice) => {
            choice.classList.remove("win", "lose");
            void choice.offsetWidth; // trigger reflow
            choice.classList.add("appear");
        });
        setTimeout(() => {
            choiceElements.forEach((choice) =>
                choice.classList.remove("appear")
            );
        }, 500);

        // choice 1 click event
        document
            .querySelector("#choice-1")
            .addEventListener("click", function () {
                this.classList.add("win");
                document.querySelector("#choice-2").classList.add("lose");
                setTimeout(() => {
                    resolve(a);
                }, 1000);
            });

        // choice 2 click event
        document
            .querySelector("#choice-2")
            .addEventListener("click", function () {
                this.classList.add("win");
                document.querySelector("#choice-1").classList.add("lose");
                setTimeout(() => {
                    resolve(b);
                }, 1000);
            });
    });
}

// copy button event listener
document.getElementById("copy-button").addEventListener("click", function () {
    const sortedChoices = JSON.stringify(sorted);
    navigator.clipboard.writeText(sortedChoices).then(() => {
        this.textContent = "Copied!";
        setTimeout(() => (this.textContent = "Copy JSON"), 2000);
    });
});

document
    .getElementById("restart-button")
    .addEventListener("click", function () {
        document.getElementById("results-screen").style.display = "none";
        document.getElementById("input-screen").style.display = "flex";
        document.body.style.overflow = "hidden";
    });
