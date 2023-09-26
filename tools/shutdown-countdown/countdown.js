// Set the date we're counting down to
const countdownDate = new Date("September 27, 2023 14:00:00").getTime();

const countdown = document.getElementById("countdown");

const body = document.querySelector("body")

function pad(d) {
    return d < 10 ? "0" + d.toString() : d.toString();
}

updateCountdown = () => {
    const now = new Date().getTime();
    const distance = countdownDate - now;

    if (distance <= 0) {
        document.querySelector("h1").style.display = "none"
        document.querySelector("p").style.display = "none"
        countdown.innerHTML = "SHUTDOWN";
        countdown.style.color = "#f00"
    } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (days < 1) {
            const redValue = Math.floor((255 / (24 * 3600)) * (distance / 1000));
            countdown.style.color = `rgb(${redValue}, ${redValue}, ${redValue})`;
            body.style.backgroundColor = `rgb(${255 - redValue}, 0, 0)`
        }

        countdown.innerHTML = `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
};

updateCountdown();

// Update the countdown every 1 second
const countdownInterval = setInterval(updateCountdown, 1000);
