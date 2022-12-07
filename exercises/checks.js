function CalculateSubtotal(){
    var bill1 = parseFloat(document.getElementById("txtBill1").value);
    var bill2 = parseFloat(document.getElementById("txtBill2").value);
    var bill3 = parseFloat(document.getElementById("txtBill3").value);
    var bill4 = parseFloat(document.getElementById("txtBill4").value);
    var subtotal = bill1 + bill2 + bill3 + bill4;
    document.getElementById("divSubtotal").innerHTML = "Subtotal: " + subtotal;
}
function CalculateTip(){
    
}