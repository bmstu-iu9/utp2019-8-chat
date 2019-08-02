'use strict'

let listeners = [];
let channels = [];

const broadcast = (channelId) => {
    const nextMsg = (lastMsg) => {
        //Get a message following the message with id=lastMsg or false
        let messages = channels[channelId];
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
        if (msg) {
            listeners[channelId][i].response.
                status(200).
                send(JSON.stringify({
                    message_id: msg.id,
                    author_id: msg.author_id,
                    author_name: msg.author_name,
                    message: msg
                }));
        }
        else {
            waiters.push(listeners[channelId][i].lastMsg);
        }
    }
    listeners[channelId] = waiters;
}

module.exports.addListener = (channelId, response, lastMsg) => {
    if (listeners[channelId] === undefined)
        listeners[channelId] = [];
    listeners[channelId].push({
        response: response,
        lastMsg: lastMsg
    });
}

module.exports.newMessage = (channelId, msg) => {
    if (channels[channelId] === undefined)
        channels[channelId] = [];
    channels[channelId].push(msg); //Warning: messages in the array must be sorted by id in ascending order!
    broadcast(channelId);
}