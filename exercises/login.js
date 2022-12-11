var attempts = 0;
var locked = false;

function login(){
    if (locked){
        return;
    }
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    
    if(username === "username" && password === "password" && attempts < 2){
        document.getElementById("beans").innerHTML = "BEANS";
        document.getElementById("whatwhat").innerHTML = "OKAY!"
        document.getElementById("whatwhat").onclick = "./index.html"
        document.getElementById("bg").setAttribute('style', 'background-image: url(/res/beans.png); opacity: 0.1;');
    }
    else{
        if(attempts >= 2){
            document.getElementById("beans").innerHTML = "LOCKED";
            document.getElementById("beans").style.color = "#ff2424";
            document.getElementById("whatwhat").style.backgroundColor = "#FFFFFFA0";
            document.getElementById("bg").setAttribute('style', 'background-image: url(https://www.bitwise.live/res/locked.png); opacity: 0.3;');
            document.getElementById("whatwhat").style.cursor = "default";
            document.getElementById("whatwhat").innerHTML = "LOCKED";
            locked = true;
        }
        else {
            attempts++;
            document.getElementById("whatwhat").innerHTML = 3 - attempts + " ATTEMPTS REMAINING";
        }
    }
}