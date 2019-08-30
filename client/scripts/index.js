'use strict'

let observe;
if (window.attachEvent) {
    observe = (element, event, handler) => {
        element.attachEvent('on' + event, handler);
    };
}
else {
    observe = (element, event, handler) => {
        element.addEventListener(event, handler, false);
    };
}
const start = () => { //Раньше называлась init
    let text = document.getElementById('text');
    const resize = () => {
        text.style.height = 'auto';
        text.style.height = text.scrollHeight + 'px';
    };
    const delayedResize = () => {
        window.setTimeout(resize, 0);
    };
    observe(text, 'change', resize);
    observe(text, 'cut', delayedResize);
    observe(text, 'paste', delayedResize);
    observe(text, 'drop', delayedResize);
    observe(text, 'keydown', delayedResize);
    observe(text, 'keyup', delayedResize);

    text.focus();
    text.select();
    resize();
}

const reload = (callback) => {
    init()
        .then((res) => {
            initSocket(() => {
                console.log(`User with ID=${res.user.id} and name=${res.user.nickname}`);
                document.getElementById("chat_names").innerHTML = "";
                for (let i in res.channels) {
                    const id = res.channels[i].id;
                    const name = res.channels[i].name;
                    createChannelDiv(id, name); 
                }
                start();
                if (callback !== undefined)
                    callback();
            });
        })
        .catch((err) => {
            console.error(err);
        });
}
reload(() => { selectChannel(1); });

let lastMsg = "";
const sendMessage = () => {
    const msgTextbox = document.getElementById("text");
    if (msgTextbox.value == "")
        return;
    socketSendMessage(msgTextbox.value);
    lastMsg = msgTextbox.value;
    msgTextbox.value = "";

}

document.getElementById("send_btn").addEventListener("click", (sender) => sendMessage());
document.getElementById("text").addEventListener("keyup", (sender) => {
    if (!sender.shiftKey && sender.keyCode == 13)
        sendMessage();
    else if (sender.key == "ArrowUp") {
        const msgTextbox = document.getElementById("input_msg");
        if (msgTextbox.value === "")
            msgTextbox.value = lastMsg;
    }
});

document.getElementById("chat_create").addEventListener("click", (sender) => {
    const ch_name = prompt("Имя канала: ");
    if (ch_name !== "") {
        createChat(ch_name)
            .then(res => { reload(); })
            .catch(err => { alert(err); });
    }
    else {
        alert("Следует ввести название для нового чата");
    }
});