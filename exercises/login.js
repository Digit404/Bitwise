var attempts = 0;

function login(){
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    
    if(username === "username" && password === "password" && attempts < 3){
        document.getElementById("beans").innerHTML = "BEANS";
        document.getElementById("whatwhat").innerHTML = "OKAY!"
    }
    else{
        if(attempts >= 3){
            document.getElementById("beans").innerHTML = "LOCKED";
            document.getElementById("beans").style.color = "#ff2424"
            document.getElementById("whatwhat").innerHTML = "LOCKED"
            document.getElementById("whatwhat").style.backgroundColor = "#FFFFFFA0";
            document.getElementById("bg").style.backgroundImage = "url(https://www.bitwise.live/res/locked.png)"
        }
        else {
            attempts++;
        }
        document.getElementById("whatwhat").innerHTML = 3 - attempts + " ATTEMPTS REMAINING";
    }
}