#!/usr/bin/nodejs
'use strict'

const express = require("express");
const fs = require("fs");

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
    response.set("Content-Type", "text/html") //Change this for each type of file (text/css and text/js)?
    response.send(file);
});


//
//  Here will be API methods
//


//Redirect to index page if request is empty
app.get("/", (request, response) => response.redirect("/index.html"));

//If page is not found
app.get("*", (request, response) => 
    response.send(fs.readFileSync("./client/404.html").toString("utf-8")));

app.listen(80); //Needs admin privileges to launch. Else - change port 80 to port 1000 (for example) 