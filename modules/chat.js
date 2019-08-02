'use strict'

/*
    message {
        id: 1,                  //Integer, starts from 1
        author_id: 42,          //Dont know
        author_name: "Alice",   //Nickname
        message: "Hello hell!"   //Text of message
    }
*/

let listeners = [];
let channels = [];

const broadcast = (channelId) => {
    if (listeners[channelId] === undefined)
        return;
    //Get a message following the message with id=lastMsg or false
    const nextMsg = (lastMsg) => {
        let messages = channels[channelId];
        if (messages === undefined)
            return false;
        if (messages.length !== 0 && lastMsg < messages[messages.length - 1].id) {
            let t = messages.length - 1;
            while (t >= 0 && messages[t].id != lastMsg)
                t--;
            t++;
            return messages[t];
        }
        else
            return false;
    }

    let waiters = []; //Array for connections that didnt get response in this broadcast
    for (let i = 0; i < listeners[channelId].length; i++) {
        let msg = nextMsg(listeners[channelId][i].lastMsg);
        if (msg) { //If new message exist
            listeners[channelId][i].response.
                status(200).
                send(JSON.stringify({
                    id: msg.id,
                    message: {
                        message_id: msg.id,
                        author_id: msg.author_id,
                        author_name: msg.author_name,
                        message: msg.message
                    }
                }));
            listeners[channelId][i].response.end();
        }
        else {
            waiters.push(listeners[channelId][i]);
        }
    }
    listeners[channelId] = waiters; //Leave in the array only opened connections
}

module.exports.addListener = (channelId, response, lastMsg) => {
    if (listeners[channelId] === undefined)
        listeners[channelId] = [];
    listeners[channelId].push({
        response: response,
        lastMsg: lastMsg
    });
    broadcast(channelId);
}

module.exports.newMessage = (channelId, msg) => {
    if (channels[channelId] === undefined)
        channels[channelId] = [];
    channels[channelId].push(msg); //Warning: messages in the array must be sorted by id in ascending order!
    broadcast(channelId);
}