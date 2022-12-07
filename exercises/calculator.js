// Global variables
let displayValue = "0"; // current value displayed on calculator screen
let firstOperand = null; // the first operand of the calculation
let operator = null; // the operator of the calculation
let waitingForSecondOperand = false; // flag for when the calculator is waiting for the second operand

// Helper function to update the calculator screen
function updateDisplay() {
  document.getElementById("thDisplay").innerText = displayValue;
}

// Function to reset the calculator
function Reset() {
  displayValue = "0";
  firstOperand = null;
  operator = null;
  waitingForSecondOperand = false;
  updateDisplay();
}

// Function to handle clicks on the number buttons
function ClickNumber(btn) {
  let btnValue = btn.innerText;

  if (waitingForSecondOperand === true) {
    // if the calculator is waiting for the second operand, reset the display and set the waiting flag to false
    displayValue = btnValue;
    waitingForSecondOperand = false;
  } else {
    // if the current display value is "0", replace it with the clicked number
    // otherwise, concatenate the clicked number to the current display value
    displayValue = displayValue === "0" ? btnValue : displayValue + btnValue;
  }

  updateDisplay();
}

// Function to handle clicks on the operator buttons
function ClickOperator(btn) {
  let btnValue = btn.innerText;

  // if the calculator is waiting for the second operand, set the operator and return
  if (waitingForSecondOperand === true) {
    operator = btnValue;
    return;
  }

  // if the first operand is null, set it to the current display value
  if (firstOperand === null) {
    firstOperand = parseFloat(displayValue);
  } else {
    // if the first operand and operator are not null, perform the calculation and update the display value
    let result = performCalculation(firstOperand, operator, parseFloat(displayValue));
    displayValue = String(result);
    firstOperand = result;
  }

  // set the operator and waiting flag
  operator = btnValue;
  waitingForSecondOperand = true;

  updateDisplay();
}

// Function to handle the "Flip" button
function Flip() {
  // if the current display value is not "0", multiply it by -1
  if (displayValue !== "0") {
    displayValue = String(parseFloat(displayValue) * -1);
  }

  updateDisplay();
}

// Helper function to perform the calculation
function performCalculation(firstOperand, operator, secondOperand) {
  if (operator === "+") {
    return firstOperand + secondOperand;
  } else if (operator === "-") {
    return firstOperand - secondOperand;
  } else if (operator === "X") {
    return firstOperand * secondOperand;
  } else if (operator === "/") {
    return firstOperand / secondOperand;
  }
}