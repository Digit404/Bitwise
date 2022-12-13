// Get references to all the input and output elements in the HTML
var inputBox = document.getElementById("input");
var outputBox = document.getElementById("output");
var quoteCheck = document.getElementById("quotes");
var mlCheck = document.getElementById("multiline");
var advCheck = document.getElementById("checkAdv");
var quotesCheck = document.getElementById('quotes');
var numQuoteCheck = document.getElementById('numQuote');
var wordWrapCheck = document.getElementById('wordWrap');
var advOptions = document.getElementById("advOptions");
var mathCheck = document.getElementById("numMath");
var inputDelimCheck = document.getElementById("inputDelimCheck");
var inputDelimBox = document.getElementById("inputDelimBox");
var showDelimCheck = document.getElementById("showDelimCheck");
var delimOptions = document.getElementById("delimOptions");
var outDelimBox = document.getElementById("outDelimBox");

var outDelim = ", "

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
};

// Main format function that is called on an interval
function format() {
    var text = [inputBox.value];
    let delimiters = inputDelimBox.value.split("|").concat(["\n", ", ", ","]); // get all delimiters separated by "|"

    outDelim = outDelimBox.value; // set the output delimiters

    for (let i = 0; i < delimiters.length; i++) {
        // for each of the delimiters
        if (delimiters[i] !== "") {
            text = text.flatMap(str => str.split(delimiters[i])); // split on each of the delimiters, this is how you flatten the list.
        }
    }

    // If the quote checkbox is checked, add quotes around each string
    if (quoteCheck.checked) {
        for (let i = 0; i < text.length; i++) {
            // If the "exclude numbers" checkbox is checked and the current string is a number,
            // don't add quotes around it
            if (!(numQuoteCheck.checked && quoteCheck.checked && !isNaN(text[i]))) {
                text[i] = '"' + text[i] + '"';
            }
        }
    }

    // If the word wrap checkbox is checked, use the word wrap function to format the text
    if (wordWrapCheck.checked && mlCheck.checked) {
        text = wordWrap(text);
    }
    // If the multiline checkbox is checked, format the text as a comma-separated list with each item on its own line
    else if (mlCheck.checked) {
        text = text.join(outDelim + "\n");
    } else {
        text = text.join(outDelim);
    }

    outputBox.value = text;
};

// copy function for copying the text to clipboard
function copy() {
    navigator.clipboard.writeText(outputBox.value);
    document.getElementById("copyButton").innerHTML = "COPIED!";

    setTimeout(function () {
        document.getElementById("copyButton").innerHTML = "COPY";
    }, 3000); // Change the text back to "COPY" after 3000 milliseconds (3 second)
};

window.copy = copy;

// advanced options checkbox listener
advCheck.addEventListener("change", function () {
    if (!this.checked) {
        advOptions.style.display = 'none';
    } else {
        advOptions.style.display = 'block';
    }
});

// delim options checkbox listener
showDelimCheck.addEventListener("change", function () {
    if (!this.checked) {
        delimOptions.style.display = 'none';
    } else {
        delimOptions.style.display = 'block';
    }
});

// multiline checkbox listener
mlCheck.addEventListener('change', function () {
    if (this.checked) {
        wordWrapCheck.disabled = false;
        wordWrapCheck.style.opacity = 1;
    } else {
        wordWrapCheck.disabled = true;
        wordWrapCheck.style.opacity = 0.5;
    }
});

// quotes checkbox listener
quotesCheck.addEventListener('change', function () {
    if (this.checked) {
        numQuoteCheck.disabled = false;
        numQuoteCheck.style.opacity = 1;
    } else {
        numQuoteCheck.disabled = true;
        numQuoteCheck.style.opacity = 0.5;
    }
});

setInterval(format, 10)