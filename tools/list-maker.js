function format() {
    // get the input value and split it into an array of lines
    var text = document.getElementById("input").value.split("\n");

    // get the selected format
    var format = document.getElementById("format").value;

    // check if the quotes checkbox is checked
    if (document.getElementById("quotes").checked) {
        // add quotes around each element in the input array
        for (var i = 0; i < text.length; i++) {
            text[i] = '"' + text[i] + '"';
        }
    }

    // check if the multiline checkbox is checked
    if (document.getElementById("multiline").checked) {
        // format the input array as a multi-line string
        text = '\n    ' + text.join(",\n    ") + "\n";
    } else {
        // format the input array as a single-line string
        text = text.join(", ");
    }

    // add the appropriate formatting to the output string, based on the selected format
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

    // update the output element with the formatted string
    document.getElementById("output").value = text;
}
