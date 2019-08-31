#!/usr/bin/nodejs
'use strict'

const fs = require("fs");
const process = require("process");
const minimist = require("minimist");
const http = require("http");
const https = require("https");
const express = require("express");

const authModule = require("./modules/auth");
const dbModule = require("./modules/dataRouter");
const chatModule = require("./modules/chat");
const apiModule = require("./modules/api");
const databaseModule = require("./modules/database");
const cliModule = require("./modules/CLI");

const argv = cliModule.getArgv(); //Possible exit in this method
const config = cliModule.loadConfig(argv.config);
const app = express();
const httpsOptions = config.use_https ?
    { key: fs.readFileSync(config.ssl_key), cert: fs.readFileSync(config.ssl_cert) } :
    undefined;
const server = config.use_https ? https.createServer(httpsOptions, app) : http.createServer(app);

databaseModule.init(config);
apiModule.init(app, authModule, dbModule, chatModule);
authModule.init(config.local_param, databaseModule);
dbModule.init(databaseModule);
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

const startServer = () => {
    const port = argv.port !== undefined ? argv.port : (config.use_https ? config.https_port : config.http_port);
    server.listen(port, () => {
        console.log(`Server started on ${port} port using ${config.use_https ? "HTTPS" : "HTTP"}`);
    });
}

const stopServer = () => {
    chatModule.stop();
    app.disable();
    process.exit(0);
    console.log("Server stopped");
}

process.once("SIGINT", (c) => { stopServer(); });

startServer();
