'use strict'

const bodyParser = require("body-parser");
const util = require('./util');

module.exports.init = (app, modules) => {
    const authModule = modules.auth;
    const dbModule = modules.db;
    const chatModule = modules.chatModule;

    const urlencodedParser = bodyParser.urlencoded({ extended: false });

    app.post("/api/get_messages", urlencodedParser, (request, response) => {
        const args = ["token", "channel_id", "offset", "count"];
        let req = util.getArgs(request, response, args);
        if (req === undefined)
            return;
        let auth = authModule.getUser(req.token); //SYNC
        dbModule.get_channel(+req.channel_id).then(channel => {
            if (!channel.success) {
                let resp = { success: false, err_code: 3, err_cause: "Channel does not exist" };
                response.status(200).send(JSON.stringify(resp));
            }
            else if (!auth.success) {
                if (channel.channel.meta.public) {
                    dbModule.chat_history(req.channel_id, req.offset, req.count).then(resp => {
                        response.status(200).send(JSON.stringify(resp));
                    });
                }
                else {
                    response.status(200).send(JSON.stringify(auth));
                }
            }
            else {
                dbModule.get_user(auth.userID).then(user => {
                    user = user.user;
                    if (util.checkPerm(user, 1) || user.channels.includes(+req.channel_id)) {
                        dbModule.chat_history(req.channel_id, req.offset, req.count).then(resp => {
                            response.status(200).send(JSON.stringify(resp));
                        });
                    }
                    else {
                        response.status(200).send(JSON.stringify(util.ERR_NO_PERMISSIONS));
                    }
                });
            }
        });
    });

    app.post("/api/send_message", urlencodedParser, (request, response) => {
        const args = ["token", "channel_id", "message"];
        let req = util.getArgs(request, response, args);
        if (req === undefined)
            return;
        let auth = authModule.getUser(req.token); //SYNC
        if (!auth.success) {
            response.status(200).send(JSON.stringify(auth));
            return;
        }
        dbModule.get_user(auth.userID).then(user => {
            user = user.user;
            if (util.checkPerm(user, 1) || user.channels.includes(+req.channel_id)) {
                dbModule.send_message(req.channel_id, req.message, auth.userID, chatModule.broadcast).then(resp => {
                    response.status(200).send(JSON.stringify(resp));
                });
            }
            else {
                response.status(200).send(JSON.stringify(util.ERR_NO_PERMISSIONS));
            }
        });
    });
}