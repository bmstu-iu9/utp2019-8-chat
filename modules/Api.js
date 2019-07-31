'use strict'
let url_reg = "http://localost:3000/api/register";
let channels_obj = [];
let session_key = "";

let span = document.createElement("span");
span.innerHTML = "Вы неправильно что-то сделали";
span.style.display = "none";
document.documentElement.children[1].appendChild(span);

function test(){
    let login = document.getElementById("login");
    let password = document.getElementById("password");
    let flag = true;
    if (login && login.value.length<=10){
        flag = false;
   };
   if (password && password.value.length<=10){
    flag = false;
   };
   if (!flag){
    return false;
   }
   //   alert("Регистрация прошла успешна!");
    return true;
};

let register = function(){
    let login = document.getElementById("login");
    let password = document.getElementById("password");
    if(span && login && password && test()){
        span.style.display = "none";
        var req = new XMLHttpRequest();
        req.onreadystatechange = function(){
            if(this.readyState == 4 && this.status == 200) {
                console.log(req.responseText);
            }
        };
    req.open("POST","http://localost:3000/api/register",true);
    let json = "{\"login\":\"" + login.value  +"\",\"password\":\"" + password.value + "\"}";
    console.log(json);
    req.send(json);
    } else {
        if (span)
            span.style.display = "block";
    }
}

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



let channels_list = function(){
    if(session_key !== ''){
    var req = new XMLHttpRequest();
    req.onreadystatechange = function (){
            if(this.readyState == 4 && this.status == 200) {
                channels_obj = this.responseText.split(',');
                for(let a of channels_obj){
                    a = JSON.parse(a);
                }
        });
                console.log(this.responseText);
            }
        };
        let json = "{\"session_key\":\"" + session_key + "\"}";
        req.open("POST","http://localost:3000/api/channels_list",true);
        req.send(json);
        return channels_obj;
    }
}


let channels_add = function(){
    let channels_id = document.getElementById("channels_id");
    if(session_key !== '' && channels_id){
    let json = "{\"session_key\":\"" + session_key  +"\",\"channels_id\":\"" + channels_id.value + "\"}";
    var req = new XMLHttpRequest();
    req.onreadystatechange = function (){
             console.log('OK for channels_add');
         }
        };
        req.open("POST","http://localost:3000/api/channels_add",true);
        req.send(json);
    }
}

let channels_remove = function(){
    let channels_id = document.getElementById("channels_id");
    if(session_key !== '' && channels_id){
    let json = "{\"session_key\":\"" + session_key +"\",\"channels_id\":\"" + channels_id.value + "\"}";
    var req = new XMLHttpRequest();
    req.onreadystatechange = function (){
         if(this.readyState == 4 && this.status == 200){

             console.log('OK for channels_remove');
         }
        };
        req.open("POST","http://localost:3000/api/channels_remove",true);
        req.send(json);
}
}


let channels_create = function(){
    let channel_name;
    if(session_key !== '' && (channel_name = document.getElementById("channel_name"))){
        var req = new XMLHttpRequest();
        req.onreadystatechange = function(){
            if(this.readyState == 4 && this.status == 200){
                console.log(this.responseText);
                return this.responseText;
            }
        }
        let json = "{\"session_key\":\"" + session_key +"\",\"channel_name\":\"" + channel_name.value + "\"}";
        req.open("POST","http://localost:3000/api/channels_create",true);
        req.send(json);
    }
}


let chat_history = function(){
    let count;
    let offset;
    let channel_id;
    if(session_key !== '' && (channel_id = document.getElementById("channel_id")) && (count = document.getElementById("count"))&&(offset = document.getElementById("offset"))){
        var req = new XMLHttpRequest();
        req.onreadystatechange = function(){
            if(this.readyState == 4 && this.status == 200){
                let res = JSON.parse(this.responseText);
              res.messages = res.messages.split(',');
                for(let a of res.messages){
                    a = JSON.parse(a);
                }
                return res;
            }

        }
        let json =  "{\"session_key\":\"" + session_key +"\",\"channel_id\":\"" + channel_id.value +"\",\"count\":\"" + count.value + "\",\"offset\":\"" + offset.value + "\"}";
        req.open("POST","http://localost:3000/api/chat_history",true);
        req.send(json);
    }
}

let send_message = function(){
    let channel_id;
    let message;
    if(session_key !== '' && (channel_id = document.getElementById("channel_id")) && (message = document.getElementById("message"))){
        var req = new XMLHttpRequest();
        req.onreadystatechange == function(){
            if(this.readyState == 4 && this.status == 200){
                console.log('OK for send_message');
            }
        }
        let json = "{\"channel_id\":\"" + channels_id.value + "\",\"message\":\"" + message.value + "\",\"session_key\":\"" + session_key +"\"}";
        json.open("POST","http://localost:3000/api/send_message",true);
    }
}

let listen = function(){
    let channel_id;
    let last_msg;
    let id;
    let message;
    if(session_key !== '' && (channel_id = document.getElementById("channel_id")) && (last_msg = document.getElementById("channel_id")) && (id = document.getElementById("id")) && (message = document.getElementById("message"))){
        var req = new XMLHttpRequest();
        req.onreadystatechange == function(){
            if(this.readyState == 4 && this.status == 200){
                let changes = JSON.parse(this.responseText);
                changes.message = JSON.parse(changes.message);
                return changes;
            }
        }
        let json = "{\"channel_id\":\"" + channels_id.value + "\",\"last_msg\":\"" + last_msg.value + "\",\"session_key\":\"" + session_key +"\"}";
        req.open("POST","http://localost:3000/api/lesten",true);
        req.send(json);
    }
}




document.getElementById("btnSend").addEventListener('click', register);
