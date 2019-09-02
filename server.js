#!/usr/bin/nodejs
'use strict'

const fs = require("fs");
const process = require("process");
const http = require("http");
const https = require("https");
const express = require("express");

const authModule = require("./modules/auth");
const dataModule = require("./modules/data");
const chatModule = require("./modules/chat");
const apiModule = require("./modules/api");
const databaseModule = require("./modules/database");
const cliModule = require("./modules/CLI");

const argv = cliModule.getArgv(); //Possible exit in this method
const config = cliModule.loadConfig(argv.config);
const app = express();
const httpsOptions = cliModule.getHttpsCert(config);
const server = config.use_https ? https.createServer(httpsOptions, app) : http.createServer(app);

databaseModule.init(config);
authModule.init(config.local_param, databaseModule);
dataModule.init(databaseModule);
chatModule.init(server, authModule, dataModule);
apiModule.init(app, authModule, dataModule, chatModule);

app.get("/", (request, response) => { response.redirect("/index.html"); });
app.use(express.static("./client"));
app.get("*", (request, response) => {
    fs.readFile("./client/404.html", (err, res) => {
        if (err)
            response.send("<h1>404 Not found</h1>");
        else
            response.send(res.toString("utf-8"));
    });
});
app.post("*", (request, response) => {
    response.send(JSON.stringify({
        success: false,
        err_code: -3,
        err_cause: `Unknown API method`
    }));
});

const startServer = () => {
    const port = cliModule.getPort(argv, config);
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