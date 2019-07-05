#!/usr/bin/nodejs
'use strict'

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


chatModule.start(app); //Enable API methods for chats work


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