'use strict'

const ws = require("ws");

const PING_INTERVAL = 30; //In seconds
const WS_PATH = "/chatSocket"

let auth, db;
let wss;
let aliveCheckerId = undefined;

const ERR_AUTH_FAILED = { success: false, err_code: 5, err_cause: "Authorization failed" };
const ERR_NO_PERMISSIONS = { success: false, err_code: 6, err_cause: "You don't have permissions to do that" };

const checkPerm = (user, check) => {
    return (user.permissions & (check | 1)) !== 0; // 1 - admin
}

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
        ws.on('pong', () => { ws.isAlive = true; });

        ws.on('message', (message) => {
            let res = JSON.parse(message);
            let user;
            if (res.token !== undefined) {
                let authId = auth.getUser(res.token).userID;
                user = db.get_user(authId);
                user = user.success ? user.user : undefined;
            }

            if (res.type === "send_message") {
                if (user === undefined) {
                    ws.send(JSON.stringify(ERR_AUTH_FAILED));
                }
                else if (checkPerm(user, 1) || user.channels.includes(res.channel_id)) {
                    db.send_message(res.channel_id, res.message, user.id, this.broadcast);
                }
                else {
                    ws.send(JSON.stringify(ERR_NO_PERMISSIONS));
                }
            }

            else if (res.type === "set_channel") {
                let channel = dbModule.get_channel(res.channel_id);
                if (!channel.success) {
                    ws.send(JSON.stringify({ success: false, err_code: 3, err_cause: "Channel does not exist" }));
                }
                else if (channel.channel.meta.public) {
                    ws.channel_id = res.channel_id;
                }
                else if (user === undefined) {
                    ws.send(JSON.stringify(ERR_AUTH_FAILED));
                }
                else if (checkPerm(user, 1) || user.channels.includes(res.channel_id)) { //TODO: permission
                    ws.channel_id = res.channel_id;
                }
                else {
                    ws.send(JSON.stringify(ERR_NO_PERMISSIONS));
                }
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