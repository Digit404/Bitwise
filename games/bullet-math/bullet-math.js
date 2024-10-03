const mathContainer = document.getElementById("math-container");

class EquationType {
    static equationTypes = [];

    constructor(name, solve, format) {
        this.name = name.toLowerCase();
        this.solve = solve;
        this.format = format;

        EquationType.equationTypes.push(this);
    }

    solve(a, b) {
        return this.solve(a, b);
    }

    getFormatted(a, b) {
        return this.format(a, b);
    }

    generateEquation() {
        const a = Math.floor(Math.random() * 10);
        const b = Math.floor(Math.random() * 10);
        const type = EquationType.equationTypes[Math.floor(Math.random() * EquationType.equationTypes.length)];

        const equation = new Equation(a, b, type);

        const equationElement = document.createElement("div");
        equationElement.classList.add("equation");
        equationElement.innerHTML = `\\[ ${equation.getFormatted()} \\]`;
        mathContainer.appendChild(equationElement);
    }

    static getEquationType(name) {
        for (let i = 0; i < equationTypes.length; i++) {
            if (equationTypes[i].name === name.toLowerCase()) {
                return equationTypes[i];
            }
        }
    }
}

class Equation {
    constructor(a, b, type) {
        this.a = a;
        this.b = b;
        this.type = type;
    }

    get result() {
        return this.type.solve(this.a, this.b);
    }

    getFormatted() {
        return this.type.getFormatted(this.a, this.b);
    }
}

new EquationType(
    "addition",
    (a, b) => a + b,
    (a, b) => `${a} + ${b}`
);
new EquationType(
    "subtraction",
    (a, b) => a - b,
    (a, b) => `${a} &minus; ${b}`
);
new EquationType(
    "multiplication",
    (a, b) => a * b,
    (a, b) => `${a} &times; ${b}`
);
new EquationType(
    "division",
    (a, b) => a / b,
    (a, b) => `\\frac{${a}}{${b}}`
);

function generateEquation() {
    const a = Math.floor(Math.random() * 10);
    const b = Math.floor(Math.random() * 10);
    const type = EquationType.equationTypes[Math.floor(Math.random() * EquationType.equationTypes.length)];

    const equation = new Equation(a, b, type);

    const equationElement = document.createElement("div");
    equationElement.classList.add("equation");
    equationElement.innerHTML = `\\[ ${equation.getFormatted()} \\]`;
    mathContainer.appendChild(equationElement);
}

generateEquation();
generateEquation();
generateEquation();
generateEquation();
generateEquation();
generateEquation();