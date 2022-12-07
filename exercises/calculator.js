// initialize state
let currentValue = 0;
let previousValue = null;
let currentOperator = null;

const thDisplay = document.getElementById('thDisplay');

// reset calculator state
function Reset() {
    currentValue = 0;
    previousValue = null;
    currentOperator = null;
    thDisplay.innerHTML = currentValue;
}

// handle number buttons
function ClickNumber(sender) {
    const number = parseInt(sender.innerHTML);
    currentValue = currentValue * 10 + number;
    thDisplay.innerHTML = currentValue;
}

// handle operator buttons
function ClickOperator(sender) {
    if (currentOperator !== null) {
        // compute result if an operator was already clicked
        Compute();
    }

    // store operator
    currentOperator = sender.innerHTML;

    // store current value and start new input
    previousValue = currentValue;
    currentValue = 0;
}

// handle equals button
function Compute() {
    let result;
    switch (currentOperator) {
        case '+':
            result = previousValue + currentValue;
            break;
        case '-':
            result = previousValue - currentValue;
            break;
        case 'X':
            result = previousValue * currentValue;
            break;
        case '/':
            result = previousValue / currentValue;
            break;
    }

    currentValue = result;
    previousValue = null;
    currentOperator = null;
    thDisplay.innerHTML = currentValue;
}

// handle plus-minus button
function Flip() {
    currentValue *= -1;
    thDisplay.innerHTML = currentValue;
}
