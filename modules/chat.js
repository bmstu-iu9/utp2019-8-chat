'use strict'

const ws = require("ws");

const PING_INTERVAL = 30; //In seconds
const WS_PATH = "/chatSocket";

const ERR_AUTH_FAILED = { success: false, err_code: 5, err_cause: "Authorization failed" };
const ERR_NO_PERMISSIONS = { success: false, err_code: 6, err_cause: "You don't have permissions to do that" };
const ERR_CHANNEL_NO_EXIST = { success: false, err_code: 3, err_cause: "Channel does not exist" };

const checkPerm = (user, check) => {
    return (user.permissions & (check | 1)) !== 0; // 1 - admin
}

module.exports.init = (server, authModule, dbModule) => {
    this.auth = authModule;
    this.db = dbModule;
    this.wss = new ws.Server({
        server,
        path: WS_PATH
    });

    this.wss.on('connection', ws => {
        ws.isAlive = true;
        ws.on('pong', () => { ws.isAlive = true; });

        ws.on('message', (message) => {
            const res = JSON.parse(message);
            const authId = this.auth.getUser(res.token).userID;
            this.db.get_user(authId).then(user => {
                user = user.success ? user.user : undefined;

                if (res.type === "send_message") {
                    if (user === undefined)
                        ws.send(JSON.stringify(ERR_AUTH_FAILED));
                    else if (checkPerm(user, 1) || user.channels.includes(res.channel_id))
                        this.db.send_message(res.channel_id, res.message, user.id, this.broadcast);
                    else
                        ws.send(JSON.stringify(ERR_NO_PERMISSIONS));
                }

                else if (res.type === "set_channel") {
                    if (res.channel_id === 0) { //Disconnect from any channel
                        ws.channel_id = undefined;
                        return;
                    }
                    dbModule.get_channel(res.channel_id).then(channel => {
                        if (!channel.success)
                            ws.send(JSON.stringify(ERR_CHANNEL_NO_EXIST));
                        else if (user === undefined)
                            ws.send(JSON.stringify(ERR_AUTH_FAILED));
                        else if (checkPerm(user, 1) || user.channels.includes(res.channel_id))
                            ws.channel_id = res.channel_id;
                        else
                            ws.send(JSON.stringify(ERR_NO_PERMISSIONS));
                    });
                }
            });
        });
    });

    this.aliveCheckerId = setInterval(() => {
        this.wss.clients.forEach(ws => {
            if (!ws.isAlive)
                return ws.terminate();
            ws.isAlive = false;
            ws.ping(null, false, true);
        });
    }, PING_INTERVAL * 1000);
}

module.exports.broadcast = (channel_id, msg) => {
    this.wss.clients.forEach(e => {
        if (e.readyState === ws.OPEN && e.channel_id == channel_id) {
            e.send(JSON.stringify({
                success: true,
                type: "new_message",
                data: msg
            }));
        }
    })
}

module.exports.stop = () => {
    if (this.aliveCheckerId !== undefined)
        clearInterval(this.aliveCheckerId);
    this.wss.clients.forEach(e => {
        e.close(1000, "Server is closing");
    });
}