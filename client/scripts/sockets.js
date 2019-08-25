'use strict'

let socket = undefined;

const initSocket = () => {
    socket = new WebSocket(`${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/chatSocket`);

    socket.onopen = (e) => {
        console.log("Web socket connected");
        socket.send(JSON.stringify({ type: "set_channel", channel_id: 1, token: getCookie("accessToken") })); //TEMP
    };

    socket.onmessage = (event) => {
        let resp = JSON.parse(event.data);
        if (!resp.success && resp.err_code === 5) {
            console.warn("Unauthorized"); //UNAUTHODRIZED
            if (confirm("Authorization failed. Do you want to reauthorize?")) {
                window.location.replace('/auth.html');
            }
        }
        if (resp.success && resp.type === "new_message") {
            addMessage(resp.data, "default.png");
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