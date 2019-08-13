#!/usr/bin/nodejs
'use strict'

const fs = require("fs");
const process = require("process");
const minimist = require('minimist');
const https = require("https");
const express = require("express");
const bodyParser = require("body-parser");

const dbModulle = require("./modules/database");
const chatModule = require("./modules/chat");


const VERSION = "v1.0.0";
const CONFIG_PATH = "./config.json";

const defaultConfig = {
    "http_port": 80,
    "https_port": 433,
    "saving_interval": 60,
    
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
    console.log(VERSION); //TODO
    process.exit(0);
}


const config = loadConfig(argv.config);
const app = express();
const urlencodedParser = bodyParser.urlencoded({extended: false});


const getArgs = (request, response, args) => {
    let res = {};
    for (let i in args) {
        res[args[i]] = request.body[args[i]];
        if (res[args[i]] === undefined) {
            response.status(200).send(JSON.stringify({
                success: false,
                err_code: 1,
                err_cause: `Argument not found (${args[i]})`
            }));
            return undefined;
        }
    }
    return res;
}

app.post("/api/register", urlencodedParser, (request, response) => {
    const args = ["login", "password"];
    let res = getArgs(request, response, args);
    if (res === undefined)
        return;
    response.status(200).send("test_REGISTER_method");
});

app.post("/api/auth", urlencodedParser, (request, response) => {
    const args = ["login", "password"];
    let res = getArgs(request, response, args);
    if (res === undefined)
        return;
    response.status(200).send("test_AUTH_method");
});

app.post("/api/get_user", urlencodedParser, (request, response) => {
    const args = ["id"];
    let res = getArgs(request, response, args);
    if (res === undefined)
        return;
    response.status(200).send("test_GET_USER_method");
});

app.post("/api/add_to_channel", urlencodedParser, (request, response) => {
    const args = ["token", "user_id", "channel_id"];
    let res = getArgs(request, response, args);
    if (res === undefined)
        return;
    response.status(200).send("test_ADD_TO_CHANNEL_method");
});

app.post("/api/remove_from_channel", urlencodedParser, (request, response) => {
    const args = ["token", "user_id", "channel_id"];
    let res = getArgs(request, response, args);
    if (res === undefined)
        return;
    response.status(200).send("test_REMOVE_FROM_CHANNEL_method");
});

app.post("/api/change_avatar", urlencodedParser, (request, response) => {
    const args = ["token", "user_id", "avatar"];
    let res = getArgs(request, response, args);
    if (res === undefined)
        return;
    response.status(200).send("test_CHANGE_AVATAR_method");
});

app.post("/api/change_meta", urlencodedParser, (request, response) => {
    const args = ["token", "user_id", "meta"];
    let res = getArgs(request, response, args);
    if (res === undefined)
        return;
    response.status(200).send("test_CHANGE_META_method");
});

app.post("/api/get_channel", urlencodedParser, (request, response) => {
    const args = ["id"];
    let res = getArgs(request, response, args);
    if (res === undefined)
        return;
    response.status(200).send("test_GET_CHANNEL_method");
});

app.post("/api/create_channel", urlencodedParser, (request, response) => {
    const args = ["token", "channel_name"];
    let res = getArgs(request, response, args);
    if (res === undefined)
        return;
    response.status(200).send("test_CREATE_CHANNEL_method");
});

app.post("/api/delete_channel", urlencodedParser, (request, response) => {
    const args = ["token", "channel_id"];
    let res = getArgs(request, response, args);
    if (res === undefined)
        return;
    response.status(200).send("test_DELETE_CHANNEL_method");
});

app.post("/api/get_messages", urlencodedParser, (request, response) => {
    const args = ["token", "channel_id", "offset", "count"];
    let res = getArgs(request, response, args);
    if (res === undefined)
        return;
    response.status(200).send("test_GET_NESSAGES_method");
});

app.post("/api/send_message", urlencodedParser, (request, response) => {
    const args = ["token", "channel_id", "message"];
    let res = getArgs(request, response, args);
    if (res === undefined)
        return;
    response.status(200).send("test_SEND_MESSAGE_method");
});

app.post("/api/listen", urlencodedParser, (request, response) => {
    const args = ["token", "channel_id", "last_msg"];
    let res = getArgs(request, response, args);
    if (res === undefined)
        return;
    chatModule.addListener(res.channel_id, response, res.last_msg);
    //Here should be no response for the request
});

app.post("/api/public_cipher", urlencodedParser, (request, response) => {
    response.status(200).send("test_PUBLIC_CIPHER_method");
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


dbModulle.load(() => {
    console.log("Data loaded");
    if (config.use_https) {
        const port = argv.port === undefined ? config.https_port : argv.port;
        const httpsOptions = {
            key: fs.readFileSync(config.ssl_key),
            cert: fs.readFileSync(config.ssl_cert)
        }        
        https.createServer(httpsOptions, app).listen(port);
        console.log(`Server started on ${port} port using HTTPS`);
    }
    else {
        const port = argv.port === undefined ? config.http_port : argv.port;
        app.listen(port);
        console.log(`Server started on ${port} port using HTTP`);
    }
});


let saverId = undefined; //Id of the saving timer
if (config.saving_interval >= 0) {
    saverId = setInterval(() => {
        console.log("Saving data...");
        dbModulle.save();
        console.log("Data saved");
    }, config.saving_interval * 1000);
}

process.once("SIGINT", (c) => { //Saving before exit
    app.disable();
    if (saverId !== undefined)
        clearInterval(saverId);
    console.log("Saving data before app closing...");
    dbModulle.save();
    console.log("Data saved");
    process.exit(0);
});