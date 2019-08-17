'use strict'

const msgTextbox = document.getElementById("input_msg");
const chatFlow = document.getElementById("chat_flow");

const getCookie = (name) => {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

const setCookie = (name, value, options = {}) => {
    options = {
        path: '/',
        ...options
    };
    if (options.expires && options.expires.toUTCString) {
        options.expires = options.expires.toUTCString();
    }
    let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
    for (let optionKey in options) {
        updatedCookie += "; " + optionKey;
        let optionValue = options[optionKey];
        if (optionValue !== true) {
            updatedCookie += "=" + optionValue;
        }
    }
    document.cookie = updatedCookie;
}

const deleteCookie = (name) => {
    setCookie(name, "", { 'max-age': -1 });
}

const addMessage = (author, text) => { //Add message to chat-flow zone
    chatFlow.innerHTML +=
        `<div class="msg_box">` +
        `<div class="msg_icon"></div>` +
        `<div class="name">${author}</div>` +
        `<div class="msg">${text}</div>` +
        `</div>`;
    chatFlow.scrollTop = 9999;
}

let socket = new WebSocket(`${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/chatSocket`);

socket.onopen = (e) => {
    console.log("Web socket connected");
    socket.send(JSON.stringify({
        type: "set_channel",
        channel_id: 1,
        token: getCookie("accessToken")
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

socket.onerror = (error) => {
    alert(`[error] ${error.message}`);
};

const sendMessage = () => {
    if (msgTextbox.value == "")
        return;
    let msg = msgTextbox.value;
    socket.send(JSON.stringify({
        type: "send_message",
        token: getCookie("accessToken"),
        channel_id: 1,
        message: msg
    }));
    msgTextbox.value = "";
}

document.getElementById("send_btn").addEventListener("click", (sender) => sendMessage());
msgTextbox.addEventListener("keyup", (sender) => {
    if (sender.key == "Enter")
        sendMessage();
});