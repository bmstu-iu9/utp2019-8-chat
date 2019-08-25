'use strict'

let socket = undefined;

const initSocket = () => {
    socket = new WebSocket(`${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/chatSocket`);

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
            addMessage(resp.data.author_name, resp.data.message, resp.data.time);
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
}