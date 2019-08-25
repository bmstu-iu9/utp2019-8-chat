'use strict'

const sendRequest = (dest, params, callback) => {
    const encodeMessage = (str) => { //Replace special charasters to codes
        return str.toString().
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
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState != 4)
            return;
        callback(xhr.responseText, xhr.status);
    }
    xhr.open('POST', dest, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    let paramStr = [];
    for (let key in params)
        paramStr.push(`${key}=${encodeMessage(params[key])}`);
    xhr.send(paramStr.join('&'));
}

const addMessage = (message, avatar) => { //Add message to chat-flow zone
    const d = new Date(message.time);
    const msgID = `${message.channel_id}_${message.time}`;
    const text = message.message.
        replace(/</g, "&lt;").
        replace(/>/g, "&gt;").
        replace(/"/g, "&quot;");
    document.getElementById("chat_flow").innerHTML +=
        `<div class="msg_box" id=${msgID}>
            <div class="msg_info_zone">
                <div class="msg_icon">
                    <img src="avatars/${avatar}">
                </div>            
            </div>
            <div class="msg_message_zone">
                <div class="name">${message.author_name}</div>
                <div class="msg_time">${d.getHours()}:${d.getMinutes()}</div>
                <div class="msg">${text}</div>
            </div>
        </div>`
    document.getElementById("chat_flow").scrollTop = 9999;
}


init()
    .then((res) => {
        console.log(`User with ID=${res.user.id} and name=${res.user.nickname}`);
        for (let i in res.channels) {
            console.log(`Channel with ID=${res.channels[i].channel.id} and name=${res.channels[i].channel.name}`)
        }

        sendRequest("/api/get_messages",
            { token: getCookie("accessToken"), channel_id: 1, offset: 0, count: 50 },
            (response, status) => {
                response = JSON.parse(response);
                if (response.success) {
                    for (let i = 0; i < response.count; i++) {
                        const cur = response.messages[i];
                        addMessage(cur, "default.png");
                    }
                }
                else {
                    console.warn(response);
                }
            });
        initSocket();
    })
    .catch((err) => {
        console.error(err);
    });


const sendMessage = () => {
    const msgTextbox = document.getElementById("input_msg");
    if (msgTextbox.value == "")
        return;
    let msg = msgTextbox.value;
    socket.send(JSON.stringify({
        type: "send_message",
        token: getCookie("accessToken"),
        channel_id: 1, //TODO: channel selecting
        message: msg
    }));
    msgTextbox.value = "";
}

document.getElementById("send_btn").addEventListener("click", (sender) => sendMessage());
document.getElementById("input_msg").addEventListener("keyup", (sender) => {
    if (sender.key == "Enter")
        sendMessage();
});
