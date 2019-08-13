'use strict'

const msgTextbox = document.getElementById("input_msg");
const chatFlow = document.getElementById("chat_flow");

// TEMPORARY
var _username = prompt("Enter nickname");
if (!_username) {
    let _names = ["Alice", "Bob", "Charlie", "Jack", "Jacob", "Mike"];
    _username = _names[Math.floor(Math.random() * (_names.length - 1))];
}
// END TEMPORARY

const addMessage = (author, text) => { //Add message to chat-flow zone
    chatFlow.innerHTML +=
        `<div class="msg_box">` + 
            `<div class="msg_icon"></div>` + 
            `<div class="name">${author}</div>` + 
            `<div class="msg">${text}</div>` + 
        `</div>`;
    document.getElementById("chat_flow").scrollTop = 9999;
}

let socket = new WebSocket(`ws://${location.host}/webSocket`);

socket.onopen = function(e) {
    console.log("Web socket connected");
};

socket.onmessage = function(event) {
    let resp = JSON.parse(event.data);
    if (resp.success && resp.type === "new_message") {
        addMessage(resp.data.author_name, resp.data.message);
    }
    else {
        console.log(resp);
    }
};

socket.onclose = function(event) {
    if (event.wasClean) {
        console.log(`[close] Соединение закрыто чисто, код=${event.code} причина=${event.reason}`);
    } else {
        console.log('[close] Соединение прервано');
    }
};

socket.onerror = function(error) {
  alert(`[error] ${error.message}`);
};


const encodeMessage = (str) => { //Replace special charasters to codes
    return str.
        replace(/\$/g, "%24").
        replace(/\&/g, "%26").
        replace(/\+/g, "%2b").
        replace(/\,/g, "%2c").
        replace(/\//g, "%2f").
        replace(/\:/g, "%3a").
        replace(/\;/g, "%3b").
        replace(/\=/g, "%3d").
        replace(/\?/g, "%3f").
        replace(/\@/g, "%40");
}

const sendMessage = () => {
    if (msgTextbox.value == "")
        return;
    let msg = msgTextbox.value;
    socket.send(JSON.stringify({
        type: "send_message",
        token: "saddaad",
        channel_id: 1,
        author_name: _username, //TEMPORARY
        message: msg
    }));
    msgTextbox.value = "";
}

document.getElementById("send_btn").addEventListener("click", (sender) => sendMessage());
msgTextbox.addEventListener("keyup", (sender) => {
    if (sender.key == "Enter")
        sendMessage();
});

// var lastMsg = 0;

// const subscribe = (url) => {
// let xhr = new XMLHttpRequest();
// xhr.onreadystatechange = () => {
//     if (xhr.readyState != 4) 
//         return;
//     if (xhr.status == 200) {
//         let response = JSON.parse(xhr.responseText);
//         lastMsg = response.id;
//         addMessage(response.message.author_name, response.message.message);
//     } else {
//         console.log(JSON.parse(xhr));
//     }
//     subscribe(url);
// }
// xhr.open("POST", url, true);
// xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
// xhr.send(`channel_id=1&last_msg=${lastMsg}`);
// }
// // subscribe("/api/listen")