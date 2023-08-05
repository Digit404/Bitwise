function calculateXP(level) {
    let total = 0;

    for (let l = 1; l < level; l++) {
        total += Math.floor(l + 300 * Math.pow(2, l / 7));
    }

    return Math.floor(total / 4);
}

function calculateLevel(xp) {
    let left = 1;
    let right = 120;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const experienceAtMid = calculateXP(mid);

        if (experienceAtMid === xp) {
            return mid; // Found exact match
        } else if (experienceAtMid < xp) {
            left = mid + 1; // Search the right half
        } else {
            right = mid - 1; // Search the left half
        }
    }

    // At this point, left > right, so right is the closest level without exceeding the targetExperience
    return right;
}

// Function to paste clipboard content into the specified input field
function pasteClipboard(inputId) {
    navigator.clipboard
        .readText()
        .then(function (text) {
            document.getElementById(inputId).value = text;
        })
        .catch(function (error) {
            console.error("Failed to read clipboard contents: ", error);
        });
    
    console.log(document.getElementById(inputId).value)

    if (!document.getElementById(inputId).value) {
        document.getElementById(inputId).value = 0;
    } else {
        console.log(document.getElementById(inputId).value)
    }
    
}

const text = document.querySelector("p");

const form = document.querySelector("#thething");

class Skill {
    static skills = [];

    constructor(name) {
        this.name = name;
        this.xpInput = document.getElementById(this.name);
        this.targetInput = document.getElementById(this.name + "-target");
        this.xpInput.value = 0;
        this.targetInput.value = 0;
        Skill.skills.push(this);
    }

    set() {
        this.xp = parseInt(this.xpInput.value);
        this.targetLevel = parseInt(this.targetInput.value);
        if (isNaN(this.targetLevel) || calculateXP(this.targetLevel) < this.xp ) {
            this.targetXP = this.xp;
            console.log("setting", this.name, this.targetXP, this.xp);
            this.targetLevel = calculateLevel(this.xp);
        } else {
            this.targetXP = calculateXP(this.targetLevel);
        }
    }

    difference() {
        let difference = this.targetXP - this.xp;
        console.log(this.name, difference);
        return (difference * 1) / 3;
    }

    static totalDiff() {
        let HPXP = 0;
        for (let skill of Skill.skills) {
            skill.set();
            HPXP += skill.difference();
        }
        return HPXP;
    }
}

const attack = new Skill("attack");
const strength = new Skill("strength");
const defense = new Skill("defense");
const magic = new Skill("magic");
const ranged = new Skill("ranged");

var HPXP;

form.addEventListener("submit", (e) => {
    e.preventDefault();

    HPXP = document.querySelector("#HP").value;

    let difference = parseInt(HPXP) + Skill.totalDiff();

    document.querySelector("p").innerHTML =
        "Final HP XP: " + Math.floor(difference) + ", Final HP Level: " + calculateLevel(difference);
});
