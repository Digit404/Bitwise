let subtotal = 0;
function CalculateSubtotal() {
    var bill1 = parseFloat(document.getElementById("txtBill1").value);
    var bill2 = parseFloat(document.getElementById("txtBill2").value);
    var bill3 = parseFloat(document.getElementById("txtBill3").value);
    var bill4 = parseFloat(document.getElementById("txtBill4").value);
    subtotal = bill1 + bill2 + bill3 + bill4;
    document.getElementById("divSubtotal").innerHTML = "Subtotal: " + subtotal;
}
function CalculateTip() {
    let tiprate = 0
    if (document.getElementsByName("tip")[0].checked) {
        tiprate = 0.10;
    } else if (document.getElementsByName("tip")[1].checked) {
        tiprate = 0.15;
    } else if (document.getElementsByName("tip")[2].checked) {
        tiprate = 0.20;
    } else if (document.getElementsByName("tip")[3].checked) {
        tiprate = 0.25;
    } else {
        tiprate = 0;
    }
    document.getElementById("divTip").innerHTML = "Tip: " + tiprate * subtotal;
}