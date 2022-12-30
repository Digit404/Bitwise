for (var i = 1; i <= 500; i++) {
    document.write('<p class="text" style="margin-top:0;">')
    if (i % 3 === 0 && i % 5 === 0) {
        document.write("FIZZBUZ");
    }
    else if (i % 3 === 0) {
        document.write("FIZZ")
    }
    else if (i % 5 === 0) {
        document.write("BUZZ")
    }
    else {
        document.write(i)
    }
    document.write("<br></p>")
}