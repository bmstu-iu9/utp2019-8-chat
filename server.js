#!/usr/bin/nodejs
'use strict'

const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({extended: false});

const express = require("express");
const fs = require("fs");
const process = require("process");

const chatModule = require("./modules/chat")

const app = express();

//Next function returns requested file, if it has html, css or js extension
app.get("*.(html|css|js)", (request, response) => {
    let file = "";
    try {
        file = fs.readFileSync(`./client${request.path}`).toString("utf-8");
    } catch {
        response.send(fs.readFileSync(`./client/404.html`).toString("utf-8"))
        return;
    }
    if (request.path.endsWith(".html"))
        response.set("Content-Type", "text/html").send(file);
    else if (request.path.endsWith(".css"))
        response.set("Content-Type", "text/css").send(file);
    else if (request.path.endsWith(".js"))
        response.set("Content-Type", "text/javascript").send(file);
});


// chatModule.start(app); //Enable API methods for chats work

//API methods
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
	response.status(200).send("test_LISTEN_method");
});

//Redirect to index page if request is empty
app.get("/", (request, response) => 
    response.redirect("/index.html"));

//If page is not found
app.get("*", (request, response) => 
    response.send(fs.readFileSync("./client/404.html").toString("utf-8")));


if (process.argv.length > 2) {
    app.listen(process.argv[2]);
    console.log(`Server started on ${process.argv[2]} port`)
}
else {
    app.listen(3000);
    console.log(`Server started on 3000 port`)
}