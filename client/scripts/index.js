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

init()
    .then((res) => {
        initSocket(() => {
            console.log(`User with ID=${res.user.id} and name=${res.user.nickname}`);
            for (let i in res.channels) {
                console.log(`Channel with ID=${res.channels[i].channel.id} and name=${res.channels[i].channel.name}`)
            }
            selectChannel(1); //TEMP
        });
    })
    .catch((err) => {
        console.error(err);
    });


let lastMsg = "";

const sendMessage = () => {
    const msgTextbox = document.getElementById("input_msg");
    if (msgTextbox.value == "")
        return;
    socketSendMessage(msgTextbox.value);
    lastMsg = msgTextbox.value;
    msgTextbox.value = "";
}

document.getElementById("send_btn").addEventListener("click", (sender) => sendMessage());
document.getElementById("input_msg").addEventListener("keyup", (sender) => {
    if (sender.key == "Enter")
        sendMessage();
    else if (sender.key == "ArrowUp") {
        const msgTextbox = document.getElementById("input_msg");
        if (msgTextbox.value === "")
            msgTextbox.value = lastMsg;
    }
});
