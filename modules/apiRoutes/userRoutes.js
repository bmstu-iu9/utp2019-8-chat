'use strict'

const bodyParser = require("body-parser");
const util = require('./util');

module.exports.init = (app, modules) => {
    const authModule = modules.auth;
    const dataModule = modules.data;
    const chatModule = modules.chat;

    const urlencodedParser = bodyParser.urlencoded({ extended: false });

    app.post("/api/get_user", urlencodedParser, (request, response) => {
        const args = ["id"];
        const req = util.getArgs(request, response, args);
        if (req === undefined)
            return;
        dataModule.get_user(req.id).then(resp => {
            response.status(200).send(JSON.stringify(resp));
        });
    });

    app.post("/api/add_to_channel", urlencodedParser, (request, response) => {
        const args = ["token", "user_id", "channel_id"];
        const req = util.getArgs(request, response, args);
        if (req === undefined)
            return;
        const auth = authModule.getUser(req.token); //SYNC
        if (!auth.success) {
            response.status(200).send(JSON.stringify(auth));
            return;
        }
        dataModule.get_user(auth.userID).then(res => {
            const user = res.user;
            dataModule.get_channel(req.channel_id).then(res => {
                const channel = res.channel;
                if (util.checkPerm(user, 1) || channel.listeners_ids.includes(user.id)) {
                    dataModule.add_to_channel(req.user_id, req.channel_id).then(resp => {
                        response.status(200).send(JSON.stringify(resp));
                    });
                }
                else {
                    response.status(200).send(JSON.stringify(util.ERR_NO_PERMISSIONS));
                }
            });
        });
    });

    app.post("/api/remove_from_channel", urlencodedParser, (request, response) => {
        const args = ["token", "user_id", "channel_id"];
        const req = util.getArgs(request, response, args);
        if (req === undefined)
            return;
        const auth = authModule.getUser(req.token); //SYNC
        if (!auth.success) {
            response.status(200).send(JSON.stringify(auth));
            return;
        }
        dataModule.get_user(auth.userID).then(res => {
            const user = res.user;
            dataModule.get_channel(req.channel_id).then(res => {
                const channel = res.channel;
                if (util.checkPerm(user, 1) || user.id === channel.owner_id) {
                    dataModule.remove_from_channel(req.user_id, req.channel_id).then(resp => {
                        response.status(200).send(JSON.stringify(resp));
                    });
                }
                else {
                    response.status(200).send(JSON.stringify(util.ERR_NO_PERMISSIONS));
                }
            });
        });
    });
}