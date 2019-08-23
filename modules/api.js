'use strict'

const getArgs = (request, response, args) => {
    let req = {};
    for (let i in args) {
        req[args[i]] = request.body[args[i]];
        if (req[args[i]] === undefined) {
            response.status(200).send(JSON.stringify({
                success: false,
                err_code: 1,
                err_cause: `Argument not found (${args[i]})`
            }));
            return undefined;
        }
    }
    return req;
}

module.exports.init = (app, urlencodedParser, authModule, dbModule, chatModule) => {    
    app.post("/api/register", urlencodedParser, (request, response) => {
        const args = ["login", "password"];
        let req = getArgs(request, response, args);
        if (req === undefined)
            return;
        let resp = authModule.register(req.login, req.password); //TODO: validate
        if (!resp.success) {
            response.status(200).send(JSON.stringify(resp));
            return;
        }
        dbModule.create_user(resp.id, req.login);
        response.status(200).send(JSON.stringify(resp));
    });
    
    app.post("/api/auth", urlencodedParser, (request, response) => {
        const args = ["login", "password"];
        let req = getArgs(request, response, args);
        if (req === undefined)
            return;
        let resp = authModule.auth(req.login, req.password);
        response.status(200).send(JSON.stringify(resp));
    });
    
    app.post("/api/exit_session", urlencodedParser, (request, response) => {
        const args = ["token"];
        let req = getArgs(request, response, args);
        if (req === undefined)
            return;
        let resp = authModule.exitSession(req.token);
        response.status(200).send(JSON.stringify(resp));
    });
    
    app.post("/api/exit_all_sessions", urlencodedParser, (request, response) => {
        const args = ["token"];
        let req = getArgs(request, response, args);
        if (req === undefined)
            return;
        let resp = authModule.exitAllSessions(req.token);
        response.status(200).send(JSON.stringify(resp));
    });
    
    app.post("/api/get_user", urlencodedParser, (request, response) => {
        const args = ["id"];
        let req = getArgs(request, response, args);
        if (req === undefined)
            return;
        let resp = dbModule.get_user(req.id);
        response.status(200).send(JSON.stringify(resp));
    });
    
    app.post("/api/add_to_channel", urlencodedParser, (request, response) => {
        const args = ["token", "user_id", "channel_id"];
        let req = getArgs(request, response, args);
        if (req === undefined)
            return;
        let auth = authModule.getUser(req.token);
        if (!auth.success) {
            response.status(200).send(JSON.stringify(auth));
            return;
        }
        let user = dbModule.get_user(auth.userID).user;
        if (user.permissions & 1 !== 0 || user.id === +req.user_id) {
            let resp = dbModule.add_to_channel(req.user_id, req.channel_id);
            response.status(200).send(JSON.stringify(resp));
        }
        else {
            let resp = { success: false, err_code: 6, err_cause: "You don't have permissions to do that" };
            response.status(200).send(JSON.stringify(resp));
        }
    });
    
    app.post("/api/remove_from_channel", urlencodedParser, (request, response) => {
        const args = ["token", "user_id", "channel_id"];
        let req = getArgs(request, response, args);
        if (req === undefined)
            return;
        let auth = authModule.getUser(req.token);
        if (!auth.success) {
            response.status(200).send(JSON.stringify(auth));
            return;
        }
        let user = dbModule.get_user(auth.userID).user;
        if (user.permissions & 1 !== 0 || user.id === +req.user_id) {
            let resp = dbModule.remove_from_channel(req.user_id, req.channel_id);
            response.status(200).send(JSON.stringify(resp));
        }
        else {
            let resp = { success: false, err_code: 6, err_cause: "You don't have permissions to do that" };
            response.status(200).send(JSON.stringify(resp));
        }
    });
    
    app.post("/api/change_avatar", urlencodedParser, (request, response) => {
        const args = ["token", "user_id", "avatar"];
        let req = getArgs(request, response, args);
        if (req === undefined)
            return;
        let auth = authModule.getUser(req.token);
        if (!auth.success) {
            response.status(200).send(JSON.stringify(auth));
            return;
        }
        let user = dbModule.get_user(auth.userID).user;
        if (user.permissions & 1 !== 0 || user.id === +req.user_id) {
            let resp = dbModule.change_avatar(req.user_id, req.avatar);
            response.status(200).send(JSON.stringify(resp));
        }
        else {
            let resp = { success: false, err_code: 6, err_cause: "You don't have permissions to do that" };
            response.status(200).send(JSON.stringify(resp));
        }
    });
    
    app.post("/api/change_meta", urlencodedParser, (request, response) => {
        const args = ["token", "user_id", "meta"];
        let req = getArgs(request, response, args);
        if (req === undefined)
            return;
        let auth = authModule.getUser(req.token);
        if (!auth.success) {
            response.status(200).send(JSON.stringify(auth));
            return;
        }
        let user = dbModule.get_user(auth.userID).user;
        if (user.permissions & 1 !== 0 || user.id === +req.user_id) {
            // NOT IMPLEMENTED
            // let resp = dbModule.(req.user_id, req.avatar);
            // response.status(200).send(JSON.stringify(resp));
            response.status(200).send(JSON.stringify({ not_implemented: true }));
        }
        else {
            let resp = { success: false, err_code: 6, err_cause: "You don't have permissions to do that" };
            response.status(200).send(JSON.stringify(resp));
        }
    });
    
    app.post("/api/get_channel", urlencodedParser, (request, response) => {
        const args = ["id"];
        let req = getArgs(request, response, args);
        if (req === undefined)
            return;
        let resp = dbModule.get_channel(req.id);
        response.status(200).send(JSON.stringify(resp));
    });
    
    app.post("/api/create_channel", urlencodedParser, (request, response) => {
        const args = ["token", "channel_name"];
        let req = getArgs(request, response, args);
        if (req === undefined)
            return;
        let auth = authModule.getUser(req.token);
        if (!auth.success) {
            response.status(200).send(JSON.stringify(auth));
            return;
        }
        let resp = dbModule.create_channel(auth.userID, req.channel_name);
        response.status(200).send(JSON.stringify(resp));
    });
    
    app.post("/api/delete_channel", urlencodedParser, (request, response) => {
        const args = ["token", "channel_id"];
        let req = getArgs(request, response, args);
        if (req === undefined)
            return;
        let auth = authModule.getUser(req.token);
        if (!auth.success) {
            response.status(200).send(JSON.stringify(auth));
            return;
        }
        let user = dbModule.get_user(auth.userID).user;
        let channel = dbModule.get_channel(req.channel_id).channel;
        if (channel === undefined) {
            let resp = { success: false, err_code: 3, err_cause: "Channel does not exist" };
            response.status(200).send(JSON.stringify(resp));
        }
        else if (user.permissions & 1 !== 0 || user.id === channel.channel.owner_id) {
            let resp = dbModule.channels_delete(req.channel_id);
            response.status(200).send(JSON.stringify(resp));
        }
        else {
            let resp = { success: false, err_code: 6, err_cause: "You don't have permissions to do that" };
            response.status(200).send(JSON.stringify(resp));
        }
        // let resp = dbModule.channels_delete(req.channel_id);
        // response.status(200).send(JSON.stringify(resp));
    });
    
    app.post("/api/get_messages", urlencodedParser, (request, response) => {
        const args = ["token", "channel_id", "offset", "count"];
        let req = getArgs(request, response, args);
        if (req === undefined)
            return;
        let auth = authModule.getUser(req.token);
        let channel = dbModule.get_channel(+req.channel_id);
        if (!channel.success) {
            let resp = { success: false, err_code: 3, err_cause: "Channel does not exist" };
            response.status(200).send(JSON.stringify(resp));
        }
        else if (!auth.success) {
            if (channel.channel.meta.public) {
                let resp = dbModule.chat_history(req.channel_id, req.offset, req.count);
                response.status(200).send(JSON.stringify(resp));
            }
            else {
                response.status(200).send(JSON.stringify(auth));
            }
        }
        else {
            let user = dbModule.get_user(auth.userID).user;
            if (user.permissions & 1 !== 0 || channel.channel.meta.public || user.channels.includes(+req.channel_id)) {
                let resp = dbModule.chat_history(req.channel_id, req.offset, req.count);
                response.status(200).send(JSON.stringify(resp));
            }
            else {
                let resp = { success: false, err_code: 6, err_cause: "You don't have permissions to do that" };
                response.status(200).send(JSON.stringify(resp));
            }
        }
    });
    
    app.post("/api/send_message", urlencodedParser, (request, response) => {
        const args = ["token", "channel_id", "message"];
        let req = getArgs(request, response, args);
        if (req === undefined)
            return;
        let auth = authModule.getUser(req.token);
        if (!auth.success) {
            response.status(200).send(JSON.stringify(auth));
            return;
        }
        let user = dbModule.get_user(auth.userID).user;
        if (user.permissions & 1 !== 0 || user.channels.includes(+req.channel_id)) {
            let resp = dbModule.send_message(req.channel_id, req.message, auth.userID, chatModule.broadcast);
            response.status(200).send(JSON.stringify(resp));
        }
        else {
            let resp = { success: false, err_code: 6, err_cause: "You don't have permissions to do that" };
            response.status(200).send(JSON.stringify(resp));
        }
    });
    
    app.post("/api/listen", urlencodedParser, (request, response) => {
        response.status(405).send("{deprecated:true}");
    });
    
    app.post("/api/public_cipher", urlencodedParser, (request, response) => {
        let resp = {};
        response.status(200).send(JSON.stringify(resp));
    });
}