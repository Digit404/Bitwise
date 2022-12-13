// Get references to all the input and output elements in the HTML
var inputBox = document.getElementById("input");
var formatDropDown = document.getElementById("format");
var outputBox = document.getElementById("output");
var quoteCheck = document.getElementById("quotes");
var mlCheck = document.getElementById("multiline");
var advCheck = document.getElementById("checkAdv");
var quotesCheck = document.getElementById('quotes');
var numQuoteCheck = document.getElementById('numQuote');
var wordWrapCheck = document.getElementById('wordWrap');
var advOptions = document.getElementById("advOptions");
var mathCheck = document.getElementById("numMath");

// Function to word wrap the text to 80 characters per line
function wordWrap(text) {
    let output = "\n    "; // indent each line with 4 spaces
    let lineLength = 0;
    for (let i = 0; i < text.length; i++) {
        // If adding the current string to the line would make it more than 80 characters,
        // move to the next line
        if (lineLength + text[i].length > 80) {
            output += "\n    ";
            lineLength = 0;
        }

        // Add the current string to the line, followed by a comma and space
        // unless it is the last string in the array
        if (i < text.length - 1) {
            output += text[i] + ", ";
            lineLength += text[i].length + 2;
        } else {
            output += text[i];
        }
    }
    return output + "\n"; // add a newline after the last string
};

// Main format function that is called on an interval
function format() {
    var text = inputBox.value.split("\n"); // split the input text by newlines
    var format = formatDropDown.value; // get the selected format

    // If the quote checkbox is checked, add quotes around each string
    if (quoteCheck.checked) {
        for (var i = 0; i < text.length; i++) {
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
    // If the multiline checkbox is checked, format the text as a comma-separated list with
    // each item on its own line, indented by 4 spaces
    else if (mlCheck.checked) {
        text = '\n    ' + text.join(",\n    ") + "\n";
    } else {
        text = text.join(", ");
    }

    // Check the format dropdown to determine how to enclose the text
    // and then set the output to the formatted text
    switch (format) {
        case "pylist":
            text = "[" + text + "]";
            break;
        case "tuple":
            text = "(" + text + ")";
            break;
        case "cpp":
            text = "{" + text + "}";
            break;
    }
    outputBox.value = text;
};

function copy() {
    navigator.clipboard.writeText(outputBox.value);
    document.getElementById("copyButton").innerHTML = "COPIED!";

    setTimeout(function() {
        document.getElementById("copyButton").innerHTML = "COPY";
    }, 3000); // Change the text back to "COPY" after 1000 milliseconds (1 second)
};

window.copy = copy;

advCheck.addEventListener("change", function () {
    if (!this.checked) {
        advOptions.style.display = 'none';
    } else {
        advOptions.style.display = 'block';
    }
});

mlCheck.addEventListener('change', function () {
    if (this.checked) {
        wordWrapCheck.disabled = false;
        wordWrapCheck.style.opacity = 1;
    } else {
        wordWrapCheck.disabled = true;
        wordWrapCheck.style.opacity = 0.5;
    }
});

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