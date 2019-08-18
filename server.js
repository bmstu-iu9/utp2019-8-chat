#!/usr/bin/nodejs
'use strict'

const fs = require("fs");
const process = require("process");
const minimist = require("minimist");
const http = require("http");
const https = require("https");
const express = require("express");
const bodyParser = require("body-parser");

const authModule = require("./modules/auth");
const dbModule = require("./modules/database");
const chatModule = require("./modules/chat");


const VERSION = "v1.0.0";
const CONFIG_PATH = "./config.json";

const defaultConfig = {
    "http_port": 80,
    "https_port": 433,
    "saving_interval": 60,

    "local_param": "azerty",

    "use_https": false,
    "ssl_cert": "./crt.pem",
    "ssl_key": "./key.pem",

    "mysql_host": "remotemysql.com",
    "mysql_user": "9SpT1uQOyM",
    "mysql_pass": "",
    "mysql_database": "9SpT1uQOyM"
}

const loadConfig = (path) => {
    let config;
    try {
        if (fs.existsSync(path)) {
            config = JSON.parse(fs.readFileSync(path));
            for (let key in defaultConfig)
                if (config[key] === undefined)
                    config[key] = defaultConfig[key];
        }
        else {
            console.error(`File "${path}" does not exist`);
            return defaultConfig;
        }
    }
    catch (err) {
        console.error("Failed to load config: " + err);
        return defaultConfig;
    }
    return config;
}

const argv = minimist(process.argv.slice(2), {
    alias: {
        'h': 'help',
        'v': 'version',
        'p': 'port',
        'c': 'config',
    },
    default: {
        'c': CONFIG_PATH,
    },
    unknown: (arg) => {
        console.error('Unknown option: ', arg)
        process.exit(-1);
    }
});
if (argv.help) {
    console.log("HELP PAGE"); //TODO
    process.exit(0);
}
if (argv.version) {
    console.log(VERSION);
    process.exit(0);
}


const config = loadConfig(argv.config);
const app = express();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const httpsOptions = {
    key: fs.readFileSync(config.ssl_key),
    cert: fs.readFileSync(config.ssl_cert)
}
const server = config.use_https ? https.createServer(httpsOptions, app) : http.createServer(app);

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

app.post("/api/register", urlencodedParser, (request, response) => {
    const args = ["login", "password"];
    let req = getArgs(request, response, args);
    if (req === undefined)
        return;
    let resp = authModule.register(req.login, req.password);
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
    //Permissions
    let resp = dbModule.add_to_channel(req.user_id, req.channel_id);
    response.status(200).send(JSON.stringify(resp));
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
    //Permissionss
    let resp = dbModule.remove_from_channel(req.user_id, req.channel_id);
    response.status(200).send(JSON.stringify(resp));
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
    //Permissionss
    let resp = dbModule.change_avatar(req.user_id, req.avatar);
    response.status(200).send(JSON.stringify(resp));
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
    //Permissionss
    // NOT IMPLEMENTED
    // let resp = dbModule.(req.user_id, req.avatar);
    response.status(200).send(JSON.stringify(resp));
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
    //Permissions
    let resp = dbModule.channels_delete(req.channel_id);
    response.status(200).send(JSON.stringify(resp));
});

app.post("/api/get_messages", urlencodedParser, (request, response) => {
    const args = ["token", "channel_id", "offset", "count"];
    let req = getArgs(request, response, args);
    if (req === undefined)
        return;
    let channel = dbModule.get_channel(req.channel_id);
    let auth = authModule.getUser(req.token);
    if (!auth.success) {
        if (!(channel.success && channel.channel.meta.public)) {
            response.status(200).send(JSON.stringify(auth));
            return;
        }
    }
    //Permissions
    let resp = dbModule.chat_history(req.channel_id, req.offset, req.count);
    response.status(200).send(JSON.stringify(resp));
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
    //Permissions
    let resp = dbModule.send_message(req.channel_id, req.message, auth.userID, chatModule.broadcast);
    response.status(200).send(JSON.stringify(resp));
});

app.post("/api/listen", urlencodedParser, (request, response) => {
    response.status(405).send("{deprecated:true}");
});

app.post("/api/public_cipher", urlencodedParser, (request, response) => {
    let resp = {};
    response.status(200).send(JSON.stringify(resp));
});


app.get("/", (request, response) => {
    response.redirect("/index.html"); //Redirect to index page if request is empty
});
app.use(express.static("./client"));
app.get("*", (request, response) => {
    response.send(fs.readFileSync("./client/404.html").toString("utf-8")); //If page is not found
});
app.post("*", (request, response) => {
    response.send(JSON.stringify({
        success: false,
        err_code: -3,
        err_cause: `Unknown API method`
    }));
});


chatModule.init(server, authModule, dbModule);
dbModule.load(() => {
    console.log("Data loaded");
    authModule.load(() => {
        console.log("Auth loaded");
        const port = argv.port !== undefined ? argv.port : (config.use_https ? config.https_port : config.http_port);
        server.listen(port, () => {
            console.log(`Server started on ${port} port using ${config.use_https ? "HTTPS" : "HTTP"}`);
        });
    });
});


let saverId = undefined; //Id of the saving timer
if (config.saving_interval >= 0) {
    saverId = setInterval(() => {
        dbModule.save(() => {
            console.log("Data saved");
            authModule.save(() => {
                console.log("Auth saved");
            });
        });
    }, config.saving_interval * 1000);
}

process.once("SIGINT", (c) => { //Saving before exit
    chatModule.stop();
    app.disable();
    if (saverId !== undefined)
        clearInterval(saverId);
    console.log("Saving data before app closing...");
    dbModule.save(() => {
        console.log("Data saved");
        authModule.save(() => {
            console.log("Auth saved");
            process.exit(0);
        });
    });
});