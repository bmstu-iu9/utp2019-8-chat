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

//checking API methods arguments function
const checkArg = (response, arg) => {
    if (request.body[arg] === undefined) {
        response.status(200).send(JSON.stringify({
            success: false,
            err_code: 1,
            err_cause: `Argument not found (${arg})`
        }));
    }
    else
        return request.body[arg];
}

//API methods
app.post("/api/register", urlencodedParser, (request, response) => {
	let login = checkArg(response, "login");
    let password = checkArg(response, "password");
    response.status(200).send("test_REGISTER_method");
});

app.post("/api/auth", urlencodedParser, (request, response) => {
	let login = checkArg(response, "login");
    let password = checkArg(response, "password");
    response.status(200).send("test_AUTH_method");
});

app.post("/api/get_user", urlencodedParser, (request, response) => {
    let id = checkArg(response, "id");
    response.status(200).send("test_GET_USER_method");
});

app.post("/api/add_to_channel", urlencodedParser, (request, response) => {
	let token = checkArg(response, "token");
    let user_id = checkArg(response, "user_id");
    let channel_id = checkArg(response, "channel_id");
    response.status(200).send("test_ADD_TO_CHANNEL_method");
});

app.post("/api/remove_from_channel", urlencodedParser, (request, response) => {
	let token = checkArg(response, "token");
    let user_id = checkArg(response, "user_id");
    let channel_id = checkArg(response, "channel_id");
    response.status(200).send("test_REMOVE_FROM_CHANNEL_method");
});

app.post("/api/change_avatar", urlencodedParser, (request, response) => {
	let token = checkArg(response, "token");
    let user_id = checkArg(response, "user_id");
    let avatar = checkArg(response, "avatar");
    response.status(200).send("test_CHANGE_AVATAR_method");
});

app.post("/api/change_meta", urlencodedParser, (request, response) => {
	let token = checkArg(response, "token");
    let user_id = checkArg(response, "user_id");
    let meta = checkArg(response, "meta");
    response.status(200).send("test_CHANGE_META_method");
});

app.post("/api/get_channel", urlencodedParser, (request, response) => {
	let id = checkArg(response, "id");
    response.status(200).send("test_GET_CHANNEL_method");
});

app.post("/api/create_channel", urlencodedParser, (request, response) => {
	let token = checkArg(response, "token");
    let channel_name = checkArg(response, "channel_name");
    response.status(200).send("test_CREATE_CHANNEL_method");
});

app.post("/api/delete_channel", urlencodedParser, (request, response) => {
	let token = checkArg(response, "token");
    let channel_id = checkArg(response, "channel_id");
    response.status(200).send("test_DELETE_CHANNEL_method");
});

app.post("/api/get_messages", urlencodedParser, (request, response) => {
	let token = checkArg(response, "token");
    let channel_id = checkArg(response, "channel_id");
    let offset = checkArg(response, "offset");
    let count = checkArg(response, "count");
    response.status(200).send("test_GET_NESSAGES_method");
});

app.post("/api/send_message", urlencodedParser, (request, response) => {
	let token = checkArg(response, "token");
    let channel_id = checkArg(response, "channel_id");
    let message = checkArg(response, "message");
    response.status(200).send("test_SEND_MESSAGE_method");
});

app.post("/api/listen", urlencodedParser, (request, response) => {
    let token = checkArg(response, "token");
    let channel_id = checkArg(response, "channel_id");
    let last_msg = checkArg(response, "last_msg");
    chatModule.addListener(channel_id, response, last_msg);
    //Here should be no response for the request
});

app.post("/api/public_cipher", urlencodedParser, (request, response) => {
	let count = checkArg(response, "count");
    let ident = checkArg(response, "ident");
    response.status(200).send("test_PUBLIC_CIPHER_method");
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