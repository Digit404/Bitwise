// Get references to all the input and output elements in the HTML
const inputBox = document.getElementById("input");
const outputBox = document.getElementById("output");
const quotesCheck = document.getElementById("quotes-check");
const mlCheck = document.getElementById("multiline-check");
const rawCheckbox = document.getElementById("raw-check");
const wordWrapCheckbox = document.getElementById("word-wrap-check");
const mathCheck = document.getElementById("numMath");
const inputDelimCheck = document.getElementById("in-delim-check");
const inputDelimBox = document.getElementById("in-delim-box");
const showDelimCheck = document.getElementById("in-delim-check");
const outDelimBox = document.getElementById("out-delim-box");
const copyButton = document.getElementById("copy-button");

let outDelim = ", ";

// Function to word wrap the text to 80 characters per line
function wordWrap(text) {
    let output = ""; // indent each line with 4 spaces
    let lineLength = 0;
    for (let i = 0; i < text.length; i++) {
        // If adding the current string to the line would make it more than 80 characters,
        // move to the next line
        if (lineLength + text[i].length > 80) {
            output += "\n";
            lineLength = 0;
        }

        // Add the current string to the line, followed by a comma and space
        // unless it is the last string in the array
        if (i < text.length - 1) {
            output += text[i] + outDelim;
            lineLength += text[i].length + outDelim.length;
        } else {
            output += text[i];
        }
    }
    return output;
}

// Main format function that is called on an interval
function format() {
    let text = [inputBox.value];
    let delimiters = inputDelimBox.value.split("|").concat(["\n", ", ", ","]); // get all delimiters separated by "|"

    outDelim = outDelimBox.value; // set the output delimiters
    outDelim = outDelim.replace(/\u00a0/g, " ");

    for (let i = 0; i < delimiters.length; i++) {
        // for each of the delimiters
        if (delimiters[i] !== "") {
            text = text.flatMap((str) => str.split(delimiters[i])); // split on each of the delimiters, this is how you flatten the list.
        }
    }

    // If the quote checkbox is checked, add quotes around each string
    if (quotesCheck.classList.contains("checked")) {
        for (let i = 0; i < text.length; i++) {
            // If the "exclude numbers" checkbox is checked and the current string is a number,
            // don't add quotes around it
            if (!(rawCheckbox.classList.contains("checked") && quotesCheck.classList.contains("checked") && !isNaN(text[i]))) {
                text[i] = '"' + text[i] + '"';
            }
        }
    }

    // If the word wrap checkbox is checked, use the word wrap function to format the text
    if (wordWrapCheckbox.classList.contains("checked") && mlCheck.classList.contains("checked")) {
        text = wordWrap(text);
    }
    // If the multiline checkbox is checked, format the text as a comma-separated list with each item on its own line
    else if (mlCheck.classList.contains("checked")) {
        text = text.join(outDelim + "\n");
    } else {
        text = text.join(outDelim);
    }

    outputBox.value = text;
}

// copy function for copying the text to clipboard
function copy() {
    navigator.clipboard.writeText(outputBox.value);
    copyButton.innerHTML = "check";
    copyButton.classList.add("check");

    setTimeout(function () {
        copyButton.innerHTML = "content_copy";
        copyButton.classList.remove("check");
    }, 2000); // Change the text back to "COPY" after 3000 milliseconds (3 second)
}

window.copy = copy;

// multiline checkbox listener
mlCheck.addEventListener("click", function () {
    this.classList.toggle("checked");
    wordWrapCheckbox.classList.remove("checked");
    wordWrapCheckbox.classList.toggle("disabled");
});

// quotes checkbox listener
quotesCheck.addEventListener("click", function () {
    this.classList.toggle("checked");
    rawCheckbox.classList.remove("checked");
    rawCheckbox.classList.toggle("disabled");
});

rawCheckbox.addEventListener("click", function () {
    this.classList.toggle("checked");
});

wordWrapCheckbox.addEventListener("click", function () {
    this.classList.toggle("checked");
});

setInterval(format, 10);
