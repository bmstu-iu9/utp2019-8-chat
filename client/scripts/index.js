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
            `<div class="name">${author}</div>` + 
            `<div class="msg">${text}</div>` + 
        `</div>`;
    document.getElementById("chat_flow").scrollTop = 9999;
}

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
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState != 4) 
            return;
        if (xhr.status == 200) { //Ok
        }
        else if (xhr.status == 401) { //Unauthorized
            msgTextbox.value = msg;
            alert("Unauthorized");
        }
        else if (xhr.status == 403) { //Forbiden
            msgTextbox.value = msg;
            alert("Forbiden");
        }
        else {
            msgTextbox.value = msg;
            alert("Something weird happened");
        }
    }
    xhr.open('POST', '/api/send_message', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(`channel_id=1&author_name=${_username}&message=${encodeMessage(msg)}`);
    msgTextbox.value = "";
}

document.getElementById("send_btn").addEventListener("click", (sender) => sendMessage());
msgTextbox.addEventListener("keyup", (sender) => {
    if (sender.key == "Enter")
        sendMessage();
});

var lastMsg = 0;

const subscribe = (url) => {
let xhr = new XMLHttpRequest();
xhr.onreadystatechange = () => {
    if (xhr.readyState != 4) 
        return;
    if (xhr.status == 200) {
        let response = JSON.parse(xhr.responseText);
        lastMsg = response.id;
        addMessage(response.message.author_name, response.message.message);
    } else {
        console.log(JSON.parse(xhr));
    }
    subscribe(url);
}
xhr.open("POST", url, true);
xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
xhr.send(`last_msg=${lastMsg}`);
}
subscribe("/api/listen")