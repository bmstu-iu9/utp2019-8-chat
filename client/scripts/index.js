'use strict'

let current_user = undefined;

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

let makeNotification = undefined;
const initNotifications = () => {
    if (!("Notification" in window)) {
        console.warn("Notifications is unsupported");
        return;
    }
    else if (Notification.permission === "granted") {
        makeNotification = (title, options) => {
            let notification = new Notification(title, options);
            notification.onclick = () => { window.parent.parent.focus(); };
        };
    }
    else if (Notification.permission !== 'denied') {
        Notification.requestPermission((permission) => {
            if (permission === "granted")
                initNotifications();
        });
    }
}

const reload = (callback) => {
    init()
        .then((res) => {
            initSocket(() => {
                current_user = res.user;
                document.getElementById("cur_user_img").src = res.user.avatar;
                document.getElementById("cur_user_name").innerText = res.user.nickname;
                document.getElementById("cur_user_id").innerText = "id " + res.user.id;
                document.getElementById("chat_names").innerHTML = "";
                for (let i in res.channels) {
                    const id = res.channels[i].id;
                    const name = res.channels[i].name;
                    createChannelDiv(id, name);
                }
                initNotifications();
                start();
                if (callback !== undefined)
                    callback();
            });
        })
        .catch(err => console.error(err));
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

document.getElementById("changeAvatarBtn").addEventListener('click', (sender) => {
    window.location.replace("/avatar_upload.html");
});

document.getElementById("exitBtn").addEventListener('click', (sender) => {
    apiExitSession()
        .then(res => { location.reload(); })
        .catch(err => { alert(err.err_cause); });
});

document.getElementById("exitAllBtn").addEventListener('click', (sender) => {
    apiExitAllSessions()
        .then(res => { location.reload(); })
        .catch(err => { alert(err.err_cause); });
});

document.getElementById("siteMapBtn").addEventListener('click', (sender) => {
    window.location.replace("/site_map.html");
});