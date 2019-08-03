'use-strict'

const fs = require("fs");
const readline = require("readline");

let UsersData = [];
let UsersChannels = [];

//Function for creating session key
const makeSessionKey = () => {
    let result = "";
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let charactersLength = characters.length;
    for (let i = 0; i < 5; i++) result += characters.charAt(Math.floor(Math.random() * charactersLength));
    return result;
}

//Registration new user
module.exports.registration = (login, password) => {
    UsersData.push({login: login, password: password, key: "", channels: []});
}

//Authentification user
module.exports.authentication = (login, password) => {
    let i = 0;
    let len = UsersData.length;
    for (; i < len; i++) {
        let cur = UsersData[i];
        if (cur.login === login) {
            if (cur.password === password) break;
            else return false;
        }
    }
    if (i === len) return false;
    let key = makeSessionKey();
    UsersData[i].key = key;
    return key;
}

//Shows all channels, available for user
module.exports.channels_list = (key) => {
    let i = 0;
    let len = UsersData.length;
    for (; i < len; i++) if (UsersData[i].key === key) break;
    if (i === len) return false;
    
    return UsersData[i].channels;
}

//Adds channel for user
module.exports.channels_add = (key, id) => {
    let i = 0;
    let len = UsersData.length;
    for (; i < len; i++) if (UsersData[i].key === key) break;
    if (i === len) return false;
    
    UsersData[i].channels.push(id);
}

//Removes channell from user (not deleting channel for all users, only for one user)
module.exports.channels_remove = (key, id) => {
    let i = 0;
    let len = UsersData.length;
    for (; i < len; i++) if (UsersData[i].key === key) break;
    if (i === len) return false;
    
    let cur = UsersData[i];
    for (i = 0; i < cur.channels.length; i++) if (cur.channels[i] === id) {
        cur.channels[i] = false;
        break;
    }
}

//Creating new channel (available for (almost)any user)
module.exports.channels_create = (key, name) => {
    let i = 0;
    let len = UsersData.length;
    for (; i < len; i++) if (UsersData[i].key === key) break;
    if (i === len) return false;
    
    UsersChannels.push({id: UsersChannels.length, name: name, messages: [false]});
    return UsersChannels.length;
}

//Deleting channel for ALL users
module.exports.channels_delete = (key, id) => {
    let i = 0;
    let len = UsersData.length;
    for (; i < len; i++) if (UsersData[i].key === key) break;
    if (i === len) return false;
    
    UsersChannels[id] = false;
}

//Returns chat history for a channel
module.exports.chat_history = (key, id, count, offset) => {
    let i = 0;
    let len = UsersData.length;
    for (; i < len; i++) if (UsersData[i].key === key) break;
    if (i === len) return false;
    
    let start = 0;
    let end = 0;
    len = UsersChannels[id].messages.length;
    if (offset < len) {
        end = len - offset;
        if (offset + count < len) start = len - offset - count;
    }
    return [count, UsersChannels[id].messages.slice(start, end)];
}

//Sending message for a channel
module.exports.send_message = (key, id, message) => {
    let i = 0;
    let len = UsersData.length;
    for (; i < len; i++) if (UsersData[i].key === key) break;
    if (i === len) return false;
    
    UsersChannels[id].messages.push({message_id: UsersChannels[id].messages.length, author_id: UsersData[i].id, author_name: UsersData[i].author_name, message: message});
    return UsersChannels[id].messages[UsersChannels[id].messages.length - 1];
}

//Information inside UsersData and UsersChannels, which accumulates during server's session, 
//saves into UsersData.json and UsersChannels.json accordingly
module.exports.save = () => {
    fs.writeFileSync("../Data/UsersData.json", JSON.stringify(UsersData[0]));
    for (let i = 1; i < UsersData.length; i++) {
        fs.appendFileSync("../Data/UsersData.json", JSON.stringify(UsersData[i]));
        if (i < UsersData.length - 1) fs.appendFileSync("../Data/UsersData.json", "\n");
    }
    fs.writeFileSync("../Data/UsersChannels.json", JSON.stringify(UsersChannels[0]));
    for (let i = 1; i < UsersChannels.length; i++) {
        fs.appendFileSync("../Data/UsersChannels.json", JSON.stringify(UsersChannels[i]));
        if (i < UsersChannels.length - 1) fs.appendFileSync("../Data/UsersChannels.json", "\n");
    }
}

//Loading information, that had been recording during previous server's sessions, 
//from UsersData.json and UsersChannels.json to UsersData and UsersChannels respectively
module.exports.load = () => {
    let current = readline.createInterface({input: fs.createReadStream("../Data/UsersData.json")});
    current.on('line', function(line) {
        UsersData.push(JSON.parse(line));
    });
    current = readline.createInterface({input: fs.createReadStream("../Data/UsersChannels.json")});
    current.on('line', function(line) {
        UsersChannels.push(JSON.parse(line));
    });
}
