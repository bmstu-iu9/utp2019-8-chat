'use strict'

const bodyParser = require("body-parser");
const util = require('./util');

module.exports.init = (app, modules) => {
    const authModule = modules.auth;
    const dbModule = modules.db;
    const chatModule = modules.chatModule;

    const urlencodedParser = bodyParser.urlencoded({ extended: false });

    app.post("/api/get_user", urlencodedParser, (request, response) => {
        const args = ["id"];
        let req = util.getArgs(request, response, args);
        if (req === undefined)
            return;
        dbModule.get_user(req.id).then(resp => {
            response.status(200).send(JSON.stringify(resp));
        });
    });

    app.post("/api/add_to_channel", urlencodedParser, (request, response) => {
        const args = ["token", "user_id", "channel_id"];
        let req = util.getArgs(request, response, args);
        if (req === undefined)
            return;
        let auth = authModule.getUser(req.token); //SYNC
        if (!auth.success) {
            response.status(200).send(JSON.stringify(auth));
            return;
        }
        let user = dbModule.get_user(auth.userID).user;
        if (util.checkPerm(user, 1) || channel.listeners_ids.includes(user.id)) {
            dbModule.add_to_channel(req.user_id, req.channel_id).then(resp => {
                response.status(200).send(JSON.stringify(resp));
            });
        }
        else {
            response.status(200).send(JSON.stringify(util.ERR_NO_PERMISSIONS));
        }
    });

    app.post("/api/remove_from_channel", urlencodedParser, (request, response) => {
        const args = ["token", "user_id", "channel_id"];
        let req = util.getArgs(request, response, args);
        if (req === undefined)
            return;
        let auth = authModule.getUser(req.token); //SYNC
        if (!auth.success) {
            response.status(200).send(JSON.stringify(auth));
            return;
        }
        let user = dbModule.get_user(auth.userID).user;
        if (util.checkPerm(user, 1) || user.id === channel.owner_id) {
            dbModule.remove_from_channel(req.user_id, req.channel_id).then(resp => {
                response.status(200).send(JSON.stringify(resp));
            });
        }
        else {
            response.status(200).send(JSON.stringify(util.ERR_NO_PERMISSIONS));
        }
    });
}