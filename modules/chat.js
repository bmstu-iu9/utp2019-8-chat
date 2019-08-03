'use strict'

/*
    message {
        id: 1,                  //Integer, starts from 1
        author_id: 42,          //Dont know
        author_name: "Alice",   //Nickname
        message: "Hello hell!"  //Text of message
    }
*/

let listeners = [];
let channels = []; //This contains only messages sended in current session

const broadcast = (channelId) => {
    const nextMsg = (lastMsg) => { //Get a message following the message with id=lastMsg or false
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

    if (listeners[channelId] === undefined)
        return;
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

//Add a new listener to the channel
module.exports.addListener = (channelId, response, lastMsg) => {
    if (listeners[channelId] === undefined)
        listeners[channelId] = [];
    listeners[channelId].push({
        response: response,
        lastMsg: lastMsg
    });
    broadcast(channelId);
}

//Add a new message to the broadcast list
module.exports.newMessage = (channelId, msg) => {
    if (channels[channelId] === undefined)
        channels[channelId] = [];
    channels[channelId].push(msg); //Warning: messages in the array must be sorted by id in ascending order!
    broadcast(channelId);
}

//Manually check the listeners in the channel for new messages
module.exports.checkListeners = (channelId) => {
    broadcast(channelId);
}