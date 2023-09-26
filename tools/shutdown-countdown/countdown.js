// Set the date we're counting down to
const countdownDate = new Date("September 30, 2023 00:00:00").getTime();

function pad(d) {
    return (d < 10) ? '0' + d.toString() : d.toString();
}

// Update the countdown every 1 second
const countdownInterval = setInterval(function () {
    const now = new Date().getTime();
    const distance = countdownDate - now;

    if (distance <= 0) {
        clearInterval(countdownInterval);
        document.getElementById("countdown").innerHTML = "EXPIRED";
    } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById("countdown").innerHTML = `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
}, 1000);