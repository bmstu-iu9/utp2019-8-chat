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
    chatFlow.scrollTop = 9999;
}

let socket = new WebSocket(`ws://${location.host}/chatSocket`);

socket.onopen = (e) => {
    console.log("Web socket connected");
    socket.send(JSON.stringify({
        type: "set_channel",
        channel_id: 1
    }));
};

socket.onmessage = (event) => {
    let resp = JSON.parse(event.data);
    if (resp.success && resp.type === "new_message") {
        addMessage(resp.data.author_name, resp.data.message);
    }
    else {
        console.log(resp);
    }
};

socket.onclose = (event) => {
    if (event.wasClean) {
        console.log(`Соединение закрыто чисто, код=${event.code} причина=${event.reason}`);
    } else {
        console.log('Соединение прервано');
    }
};

socket.onerror = (error) =>  {
  alert(`[error] ${error.message}`);
};

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