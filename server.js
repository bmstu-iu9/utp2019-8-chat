#!/usr/bin/nodejs
'use strict'

const express = require("express");
const bodyParser = require("body-parser");  
const fs = require("fs");

const app = express();
const urlencodedParser = bodyParser.urlencoded({extended: false});

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


//
//  Here will be API methods
//

app.post("/api/send_message", urlencodedParser, (request, response) => {
    console.log(request.body.message);
    response.status(200).send(JSON.stringify({result:true}))
});


class message {
    static _counter = 0;
    constructor(author_name, message) {
        this.author_name = author_name;
        this.message = message;
        this.id = _counter++;
    }
}

var messages = []; //Now we accepts only one channel
var subscribers = [];

const checkSubscribers = () => {
    for (let i = 0; i < subscribers.length; i++) {
        if (messages.length != 0 && subscribers[i].last_msg < messages[messages.length - 1].id) {
            let t = messages.length - 1;
            while (messages[t].id != subscribers[i].last_msg)
                t--;
            t++;
            subscribers[i].response.send(JSON.stringify({
                id: messages[t].id, //Its id of change. Now it equal to id of message
                message: {
                    message_id: messages[t].id,
                    author_id: 0, //FIX THIS!!!!!!!
                    author_name: messages[t].author_name,
                    message: messages[t].message
                }
            }));
            subscribers[i].response.end();
            subscribers[i].del = true;
        }
    }
    let temp = [];
    subscribers.forEach((e) => {
        if (!e.del)
            temp.push(e);
    })
    subscribers = temp;
}

app.post("/api/listen", urlencodedParser, (request, response) => {
    subscribers.push({
        response: response,
        last_msg: request.body.last_msg
    });
    checkSubscribers();
});

app.post("/api/send_message", urlencodedParser, (request, response) => {
    let msg = new message(request.body.author_name, request.body.message);
    messages.push(msg);
    response.status(200).send(JSON.stringify({result:true}));
    checkSubscribers();
    console.log(`
        Author: ${msg.author}
        Message: ${msg.message}
        ID: ${msg.id}
        ===========================================
        `);
});


//Redirect to index page if request is empty
app.get("/", (request, response) => 
    response.redirect("/index.html"));

//If page is not found
app.get("*", (request, response) => 
    response.send(fs.readFileSync("./client/404.html").toString("utf-8")));

app.listen(3000); //Needs admin privileges to launch. Else - change port 80 to port 3000 (for example) 