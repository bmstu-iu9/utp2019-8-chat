'use strict'

let socket = undefined;
let curChannel = 0;

const makeMention = (author, message) => {
    if (makeNotification !== undefined) {
        makeNotification(`Вас упомянул ${author}`, {
            body: message,
            icon: '/styles/favicon.ico',
            dir: 'auto',
            lang: 'RU'
        });
    }
}

const socketSelectChannel = (id) => {
    socket.send(JSON.stringify({ type: "set_channel", token: getCookie("accessToken"), channel_id: id }));
    curChannel = id;
}

const socketSendMessage = (msg) => {
    socket.send(JSON.stringify({
        type: "send_message",
        token: getCookie("accessToken"),
        channel_id: curChannel,
        message: msg
    }));
}

const initSocket = (opened) => {
    if (socket !== undefined)
        socket.close();
    socket = new WebSocket(`${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/chatSocket`);
    socket.onopen = (e) => {
        console.log("Web socket connected");
        opened();
    };

    socket.onmessage = (event) => {
        let resp = JSON.parse(event.data);
        if (!resp.success && resp.err_code === 5) { //UNAUTHODRIZED
            console.warn("Unauthorized");
            if (confirm("Authorization failed. Do you want to reauthorize?")) {
                window.location.replace('/auth.html');
            }
        }
        else if (!resp.success && resp.err_code === 6) { //FORBIDDEN
            console.warn("Forbidden");
            alert("You don't have permissions to do that");
        }
        else if (resp.success && resp.type === "new_message") {
            createMessage(resp.data, undefined, makeMention).then((msg) => {
                document.getElementById("chat_flow").innerHTML += msg;
                document.getElementById("chat_flow").scrollTop = 9999;
            });
        }
        else if (resp.success) {
            console.warn(`Unknown message: ${JSON.stringify(resp)}`);
        }
        else {
            console.warn(`Error: ${JSON.stringify(resp)}`);
        }
    };

    socket.onclose = (event) => {
        if (event.wasClean) {
            if (event.code === 1000) {
                console.log("Websocket connection was closed. Server is closing.");
            }
            else {
                console.log(`Websocket connection was closed, code=${event.code} reason=${event.reason}`);
            }
        }
        else {
            console.error("Websocket connection was interrupted");
        }
    };

    socket.onerror = (error) => {
        console.error(`Websocket error: ${error.message}`)
    };
}