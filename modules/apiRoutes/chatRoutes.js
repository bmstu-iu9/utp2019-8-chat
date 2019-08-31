'use strict'

const bodyParser = require("body-parser");
const util = require('./util');

module.exports.init = (app, modules) => {
    const authModule = modules.auth;
    const dbModule = modules.db;
    const chatModule = modules.chatModule;

    const urlencodedParser = bodyParser.urlencoded({ extended: false });

    app.post("/api/get_channel", urlencodedParser, (request, response) => {
        const args = ["id"];
        let req = util.getArgs(request, response, args);
        if (req === undefined)
            return;
        dbModule.get_channel(req.id).then(resp => {
            response.status(200).send(JSON.stringify(resp));
        });
    });

    app.post("/api/create_channel", urlencodedParser, (request, response) => {
        const args = ["token", "channel_name"];
        let req = util.getArgs(request, response, args);
        if (req === undefined)
            return;
        let auth = authModule.getUser(req.token); //SYNC
        if (!auth.success) {
            response.status(200).send(JSON.stringify(auth));
            return;
        }
        dbModule.create_channel(auth.userID, req.channel_name).then(resp => {
            response.status(200).send(JSON.stringify(resp));
        });
    });

    app.post("/api/delete_channel", urlencodedParser, (request, response) => {
        const args = ["token", "channel_id"];
        let req = util.getArgs(request, response, args);
        if (req === undefined)
            return;
        let auth = authModule.getUser(req.token); //SYNC
        if (!auth.success) {
            response.status(200).send(JSON.stringify(auth));
            return;
        }
        let user = dbModule.get_user(auth.userID);
        let channel = dbModule.get_channel(req.channel_id);
        Promise.all([user, channel]).then(res => {
            if (res.channel === undefined) {
                let resp = { success: false, err_code: 3, err_cause: "Channel does not exist" };
                response.status(200).send(JSON.stringify(resp));
            }
            else if (util.checkPerm(user, 1) || user.id === channel.channel.owner_id) {
                dbModule.channels_delete(req.channel_id).then(resp => {
                    response.status(200).send(JSON.stringify(resp));
                });
            }
            else {
                response.status(200).send(JSON.stringify(util.ERR_NO_PERMISSIONS));
            }
        });
    });

    app.post("/api/get_all_channels", urlencodedParser, (request, response) => {
        const args = ["token"];
        let req = util.getArgs(request, response, args);
        if (req === undefined)
            return;
        let auth = authModule.getUser(req.token); //SYNC
        if (!auth.success) {
            response.status(200).send(JSON.stringify(auth));
            return;
        }
        dbModule.get_user(auth.userID)
            .then(user => {
                if (util.checkPerm(user.user, 2)) {
                    dbModule.get_all_channels().then(resp => {
                        response.status(200).send(JSON.stringify(resp));
                    });
                }
                else {
                    response.status(200).send(JSON.stringify(util.ERR_NO_PERMISSIONS));
                }
            });
    });
}