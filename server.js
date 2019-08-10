#!/usr/bin/nodejs
'use strict'

const DEFAULT_PORT = 3000; //Warning: some ports require the admin privileges to launch the server (80 for example)
const SAVING_INTERVAL = 60; //In seconds (Set a negative number to disable autosaving)

const fs = require("fs");
const process = require("process");
const express = require("express");
const bodyParser = require("body-parser");

const dbModulle = require("./modules/database");
const chatModule = require("./modules/chat");

const app = express();
const urlencodedParser = bodyParser.urlencoded({extended: false});


app.post("/api/register", urlencodedParser, (request, response) => {
	response.status(200).send("test_REGISTER_method");
});

app.post("/api/auth", urlencodedParser, (request, response) => {
	response.status(200).send("test_AUTH_method");
});

app.post("/api/channels_list", urlencodedParser, (request, response) => {
	response.status(200).send("test_CHANNELS_LIST_method");
});

app.post("/api/channels_add", urlencodedParser, (request, response) => {
	response.status(200).send("test_CHANNELS_ADD_mehod");
});

app.post("/api/channels_remove", urlencodedParser, (request, response) => {
	response.status(200).send("test_CHANNELS_REMOVE_method");
});

app.post("/api/channels_create", urlencodedParser, (request, response) => {
	response.status(200).send("test_CHANNELS_CREATE_method");
});

app.post("/api/channels_delete", urlencodedParser, (request, response) => {
	response.status(200).send("test_CHANNELS_DELETE_method");
});

app.post("/api/chat_history", urlencodedParser, (request, response) => {
	response.status(200).send("test_CHAT_HISTORY_method");
});

app.post("/api/send_message", urlencodedParser, (request, response) => {
    response.status(200).send("test_SEND_MESSAGE_method");
});

app.post("/api/listen", urlencodedParser, (request, response) => {
    let token, channel_id, last_msg;
    token = request.body.token;
    if (token === undefined) {
        response.status(200).send(JSON.stringify({
            err_code: 1, //Wrong number of arguments
            err_cause: `Argument not found (token)`
        }));
    }
    channel_id = request.body.channel_id;
    if (channel_id === undefined) {
        response.status(200).send(JSON.stringify({
            err_code: 1, //Wrong number of arguments
            err_cause: `Argument not found (channel_id)`
        }));
    }
    last_msg = request.body.last_msg;
    if (last_msg === undefined) {
        response.status(200).send(JSON.stringify({
            err_code: 1, //Wrong number of arguments
            err_cause: `Argument not found (last_msg)`
        }));
    }
    chatModule.addListener(channel_id, response, last_msg);
    //Here should be no response for the request
});


app.get("/", (request, response) => {
    response.redirect("/index.html"); //Redirect to index page if request is empty
});
app.use(express.static("./client"));
app.get("*", (request, response) => {
    response.send(fs.readFileSync("./client/404.html").toString("utf-8")); //If page is not found
});


dbModulle.load(() => {
    console.log("Data loaded");
    const port = process.argv.length > 2 ? process.argv[2] : DEFAULT_PORT;
    app.listen(port);
    console.log(`Server started on ${port} port`);
});


let saverId = undefined; //Id of the saving timer
if (SAVING_INTERVAL >= 0) {
    saverId = setInterval(() => {
        console.log("Saving data...");
        dbModulle.save();
        console.log("Data saved");
    }, SAVING_INTERVAL * 1000);
}

process.once("SIGINT", (c) => { //Saving before exit
    app.disable();
    if (saverId !== undefined)
        clearInterval(saverId);
    console.log("Saving data before app closing...");
    dbModulle.save();
    console.log("Data saved");
    process.exit(-1);
});