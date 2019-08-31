'use strict'

const bodyParser = require("body-parser");
const util = require('./util');

module.exports.init = (app, modules) => {
    const authModule = modules.auth;
    const dbModule = modules.db;
    const chatModule = modules.chatModule;

    const urlencodedParser = bodyParser.urlencoded({ extended: false });

    app.post("/api/register", urlencodedParser, (request, response) => {
        const args = ["login", "password"];
        let req = util.getArgs(request, response, args);
        if (req === undefined)
            return;
        if (!util.checkLogin(req["login"])) {
            response.status(200).send(JSON.stringify({
                success: false,
                err_code: 8,
                err_cause: `Login can be between 1 and 20 characters long
        					and have only latin characters, numbers
        					underscores, points, dashes and spaces`
            }));
            return;
        }
        if (!util.checkPassword(req["password"])) {
            response.status(200).send(JSON.stringify({
                success: false,
                err_code: 8,
                err_cause: `Password can be more than 5 characters long
        					and have at least one latin character and one number`
            }));
            return;
        }
        authModule.register(req.login, req.password).then(resp => {
            if (!resp.success) {
                response.status(200).send(JSON.stringify(resp));
            }
            else {
                dbModule.add_to_channel(resp.id, 1).then(resp => { //Global chat
                    response.status(200).send(JSON.stringify(resp));
                });
            }
        });
    });

    app.post("/api/auth", urlencodedParser, (request, response) => {
        const args = ["login", "password"];
        let req = util.getArgs(request, response, args);
        if (req === undefined)
            return;
        if (!util.checkLogin(req["login"])) {
            response.status(200).send(JSON.stringify({
                success: false,
                err_code: 8,
                err_cause: `Login can be between 1 and 20 characters long
        					and have only latin characters, numbers
        					underscores, points, dashes and spaces`
            }));
            return;
        }
        if (!util.checkPassword(req["password"])) {
            response.status(200).send(JSON.stringify({
                success: false,
                err_code: 8,
                err_cause: `Password can be between 6 and 20 characters long
        					and have only latin characters and numbers`
            }));
            return;
        }
        authModule.auth(req.login, req.password).then(resp => {
            response.status(200).send(JSON.stringify(resp));
        });
    });

    app.post("/api/check_token", urlencodedParser, (request, response) => {
        const args = ["token"];
        let req = util.getArgs(request, response, args);
        if (req === undefined)
            return;
        let resp = authModule.getUser(req.token); //SYNC
        response.status(200).send(JSON.stringify(resp));
    });

    app.post("/api/exit_session", urlencodedParser, (request, response) => {
        const args = ["token"];
        let req = util.getArgs(request, response, args);
        if (req === undefined)
            return;
        let resp = authModule.exitSession(req.token); //SYNC
        response.status(200).send(JSON.stringify(resp));
    });

    app.post("/api/exit_all_sessions", urlencodedParser, (request, response) => {
        const args = ["token"];
        let req = util.getArgs(request, response, args);
        if (req === undefined)
            return;
        let resp = authModule.exitAllSessions(req.token); //SYNC
        response.status(200).send(JSON.stringify(resp));
    });
}