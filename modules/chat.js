'use strict'

const bodyParser = require("body-parser");  
const urlencodedParser = bodyParser.urlencoded({extended: false});

let msgCounter = 0;

class message { 
    constructor(author_name, message) {
        this.author_name = author_name;
        this.message = message;
        this.id = msgCounter++;
    }
}

var messages = []; //Now we accepts only one channel
var subscribers = [new message("Hottabych", "You know")]; //One message, that considers "Readed" by all users (its bugfix)

const checkSubscribers = () => {
    for (let i = 0; i < subscribers.length; i++) {
        if (messages.length != 0 && subscribers[i].last_msg < messages[messages.length - 1].id) {
            let t = messages.length - 1;
            while (t >= 0 && messages[t].id != subscribers[i].last_msg)
                t--;
            t++;
            subscribers[i].response.status(200).send(JSON.stringify({
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
    });
    subscribers = temp;
}

module.exports.start = (app) => {
    
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
        console.log(
            `Author: ${msg.author_name}\n` + 
            `Message: ${msg.message}\n` + 
            `ID: ${msg.id}\n` + 
            `===========================================`);
    });
}