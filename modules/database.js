'use-strict'

const fs = require("fs");

let UsersData = [];
let UsersChannels = [];

const makeSessionKey = () => {
    let result = "";
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let charactersLength = characters.length;
    for (let i = 0; i < 5; i++) result += characters.charAt(Math.floor(Math.random() * charactersLength));
    return result;
}

module.exports.registration = (login, password) => {
    UsersData.push({login: login, password: password, key: "", channels: []});
}

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

module.exports.channels_list = (key) => {
    let i = 0;
    let len = UsersData.length;
    for (; i < len; i++) if (UsersData[i].key === key) break;
    if (i === len) return false;
    return UsersData[i].channels;
}

module.exports.channels_add = (key, id) => {
    let i = 0;
    let len = UsersData.length;
    for (; i < len; i++) if (UsersData[i].key === key) break;
    if (i === len) return false;
    UsersData[i].channels.push(id);
}

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

module.exports.channels_create = (key, name) => {
    let i = 0;
    let len = UsersData.length;
    for (; i < len; i++) if (UsersData[i].key === key) break;
    if (i === len) return false;
    UsersChannels.push({id: UsersChannels.length, name: name, messages: []});
    return UsersChannels.length;
}

module.exports.channels_delete = (key, id) => {
    let i = 0;
    let len = UsersData.length;
    for (; i < len; i++) if (UsersData[i].key === key) break;
    if (i === len) return false;
    UsersChannels[id] = false;
}

module.exports.chat_history = (key, id, count, offset) => {
    let i = 0;
    let len = UsersData.length;
    for (; i < len; i++) if (UsersData[i].key === key) break;
    if (i === len) return false;
    return count, UsersChannels[id].messages.slice(-offset - count, -offset);
}
