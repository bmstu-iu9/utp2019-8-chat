#!/usr/bin/nodejs
'use strict'

const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({extended: false});

const express = require("express");
const fs = require("fs");
const process = require("process");

const chatModule = require("./modules/chat");

const app = express();

app.use(express.static("./client"));

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
    //Here must be getted a message object from database
    //and called the chatModule.newMessage(ch, msg) method
    response.status(200).send("test_SEND_MESSAGE_method");
});

app.post("/api/listen", urlencodedParser, (request, response) => {
    chatModule.addListener(request.body.channel_id, response, request.body.last_msg);
    //Here should be no response for the request
});


//Redirect to index page if request is empty
app.get("/", (request, response) => 
    response.redirect("/index.html"));

//If page is not found
app.get("*", (request, response) => 
    response.send(fs.readFileSync("./client/404.html").toString("utf-8")));


if (process.argv.length > 2) {
    app.listen(process.argv[2]);
    console.log(`Server started on ${process.argv[2]} port`);
}
else {
    app.listen(3000);
    console.log(`Server started on 3000 port`);
}