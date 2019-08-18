'use strict'

const ws = require("ws");

const PING_INTERVAL = 30; //In seconds
const WS_PATH = "/chatSocket"

let auth, db;
let wss;
let aliveCheckerId = undefined;

module.exports.broadcast = (channel_id, msg) => {
    wss.clients.forEach((e) => {
        if (e.readyState === ws.OPEN && e.channel_id == channel_id) {
            e.send(JSON.stringify({
                success: true,
                type: "new_message",
                data: msg
            }));
        }
    })
}

module.exports.init = (server, authModule, dbModule) => {
    auth = authModule;
    db = dbModule;
    wss = new ws.Server({
        server,
        path: WS_PATH
    });
    wss.on('connection', (ws) => {
        ws.isAlive = true;

        ws.on('pong', () => {
            ws.isAlive = true;
        });

        ws.on('message', (message) => {
            let res = JSON.parse(message);
            let authId;
            if (res.token !== undefined) {
                authId = auth.getUser(res.token);
            }
            if (res.type === "send_message") {
                if (res.token === undefined || !authId.success) {
                    ws.send(JSON.stringify({ success: false, err_code: 5, err_cause: "Wrong access token" }));
                    return;
                }
                //Permissions
                db.send_message(res.channel_id, res.message, authId.userID, this.broadcast);
            }
            else if (res.type === "set_channel") {
                if (res.token === undefined || !authId.success) {
                    let channel = dbModule.get_channel(res.channel_id);
                    if (channel.success && channel.channel.meta.public) {
                        ws.channel_id = res.channel_id;
                    }
                    else {
                        ws.send(JSON.stringify({ success: false, err_code: 5, err_cause: "Wrong access token" }));
                        return;
                    }
                }
                ws.channel_id = res.channel_id;
            }
        });
    });

    aliveCheckerId = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (!ws.isAlive)
                return ws.terminate();
            ws.isAlive = false;
            ws.ping(null, false, true);
        });
    }, PING_INTERVAL * 1000);
}

module.exports.stop = () => {
    if (aliveCheckerId !== undefined)
        clearInterval(aliveCheckerId);
    wss.clients.forEach((e) => {
        e.close(1000, "Server is closing");
    });
}