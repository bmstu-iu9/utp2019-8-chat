'use strict'

const bodyParser = require("body-parser");
const util = require('./util');

module.exports.init = (app, modules) => {
    const authModule = modules.auth;
    const dataModule = modules.data;
    const chatModule = modules.chat;

    const urlencodedParser = bodyParser.urlencoded({ extended: false });

    app.post("/api/get_messages", urlencodedParser, (request, response) => {
        const args = ["token", "channel_id", "offset", "count"];
        const req = util.getArgs(request, response, args);
        if (req === undefined)
            return;
        const auth = authModule.getUser(req.token); //SYNC
        dataModule.get_channel(+req.channel_id).then(channel => {
            if (!channel.success) {
                response.status(200).send(JSON.stringify(util.ERR_CHANNEL_NO_EXIST));
            }
            else if (!auth.success) {
                if (channel.channel.meta.public) { //???
                    dataModule.chat_history(req.channel_id, req.offset, req.count).then(resp => {
                        response.status(200).send(JSON.stringify(resp));
                    });
                }
                else {
                    response.status(200).send(JSON.stringify(auth));
                }
            }
            else {
                dataModule.get_user(auth.userID).then(user => {
                    user = user.user;
                    if (util.checkPerm(user, 1) || user.channels.includes(+req.channel_id)) {
                        dataModule.chat_history(req.channel_id, req.offset, req.count).then(resp => {
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
        const req = util.getArgs(request, response, args);
        if (req === undefined)
            return;
        const auth = authModule.getUser(req.token); //SYNC
        if (!auth.success) {
            response.status(200).send(JSON.stringify(auth));
            return;
        }
        dataModule.get_user(auth.userID).then(user => {
            user = user.user;
            if (util.checkPerm(user, 1) || user.channels.includes(+req.channel_id)) {
                dataModule.send_message(req.channel_id, req.message, auth.userID, chatModule.broadcast).then(resp => {
                    response.status(200).send(JSON.stringify(resp));
                });
            }
            else {
                response.status(200).send(JSON.stringify(util.ERR_NO_PERMISSIONS));
            }
        });
    });
}