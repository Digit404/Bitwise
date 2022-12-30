var value = 0;

function update() {
    document.getElementById("thDisplay").innerHTML = value;
}

function Reset() {
    value = 0;
    update();
}

function ClickNumber(button) {
    if (value === 0) {
        value = button.innerHTML;
    }
    else {
        value = String(value) + button.innerText;
    }
    update();
}

function decimal() {
    if (!isNaN(eval(String(value) + "."))) {
        value = String(value) + ".";
    }
    update();
}

function ClickOperator(button) {
    value = String(value) + button.innerText;
    update();
}

function solve() {
    value = eval(value);
    update();
}

function Flip() {
    value = eval(value) * -1;
    update();
}