#!/usr/bin/nodejs
'use strict'

const fs = require("fs");
const process = require("process");
const minimist = require("minimist");
const http = require("http");
const https = require("https");
const express = require("express");

const authModule = require("./modules/auth");
const dbModule = require("./modules/database");
const chatModule = require("./modules/chat");
const apiModule = require("./modules/api")

const VERSION = "v1.0.0";
const CONFIG_PATH = "./config.json";

//#region config
const defaultConfig = {
    "http_port": 80,
    "https_port": 433,
    "saving_interval": 60,

    "local_param": "HOImvA9jBnyU36uuex2QNIhtRoOPnpr5Bv+S65Qb8CE=",

    "use_https": false,
    "ssl_cert": "./crt.pem",
    "ssl_key": "./key.pem",

    "mysql_host": "remotemysql.com",
    "mysql_user": "9SpT1uQOyM",
    "mysql_pass": "utp2019password",
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
//#endregion

//#region command_line
const argv = minimist(process.argv.slice(2), {
    alias: {
        'h': 'help',
        'v': 'version',
        'p': 'port',
        'c': 'config',
    },
    boolean: ['init', 'reinit'],
    default: { 'c': CONFIG_PATH },
    unknown: (arg) => {
        console.error('Unknown option: ', arg)
        process.exit(-1);
    }
});
if (argv.help) {
    const clHelpString = `See: https://github.com/bmstu-iu9/utp2019-8-chat`;
    console.log(clHelpString);
    process.exit(0);
}
if (argv.version) {
    console.log(VERSION);
    process.exit(0);
}
if (argv.init) {
    fs.mkdirSync("./Data");
    fs.mkdirSync("./Data/messages");
    fs.writeFileSync("./Data/auth.json", "[]");
    fs.writeFileSync("./Data/users.json", "[]");
    fs.writeFileSync("./Data/channels.json", "[]");
    console.log("Done");
    process.exit(0);
}
if (argv.reinit) {
    fs.writeFileSync("./Data/auth.json", "[]");
    fs.writeFileSync("./Data/users.json", "[]");
    fs.writeFileSync("./Data/channels.json", "[]");
    const files = fs.readdirSync("./Data/messages");
    for (let file of files)
        fs.unlinkSync(`./Data/messages/${file}`);
    console.log("Done");
    process.exit(0);
}
//#endregion

const config = loadConfig(argv.config);
const app = express();
const httpsOptions = config.use_https ?
    { key: fs.readFileSync(config.ssl_key), cert: fs.readFileSync(config.ssl_cert) } :
    undefined;
const server = config.use_https ? https.createServer(httpsOptions, app) : http.createServer(app);

apiModule.init(app, authModule, dbModule, chatModule);
authModule.init(config.local_param);
chatModule.init(server, authModule, dbModule);

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

let saverId = undefined; //Id of the saving timer
if (config.saving_interval >= 0) {
    saverId = setInterval(async () => {
        console.log("Saving data...");
        await dbModule.save();
        await authModule.save();
        console.log("Data saved");
    }, config.saving_interval * 1000);
}

const startServer = async () => {
    await dbModule.load();
    await authModule.load();
    console.log("Data loaded");
    const port = argv.port !== undefined ? argv.port : (config.use_https ? config.https_port : config.http_port);
    server.listen(port, () => {
        console.log(`Server started on ${port} port using ${config.use_https ? "HTTPS" : "HTTP"}`);
    });
}

const stopServer = async () => {
    chatModule.stop();
    app.disable();
    if (saverId !== undefined)
        clearInterval(saverId);
    console.log("Saving data before app closing...");
    await dbModule.save();
    await authModule.save();
    console.log("Data saved");
    process.exit(0);
}

//Saving before exit
process.once("SIGINT", (c) => { stopServer(); });

startServer();