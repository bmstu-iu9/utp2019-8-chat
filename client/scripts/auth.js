let auth = function(){
    let login = document.getElementById("login");
    let password = document.getElementById("password");
    if(login && password){
        var req = new XMLHttpRequest();
        req.onreadystatechange = function (){
                if(this.readyState == 4 && this.status == 200) {
                    console.log(req.responseText);
                    if (req.responseText !== "") {
                        session_key = req.responseText;
                        return session_key;
                    }
                }
            };
            req.open("POST","http://localost:3000/api/auth",true);
            let json = "{\"login\":\"" + login.value  +"\",\"password\":\"" + password.value + "\"}";
            console.log(json);
            req.send(json);
    }
}
