'use-strict'

const fs = require("fs");

let UsersData = [];

const makeSessionKey() {
    let result = "";
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let charactersLength = characters.length;
    for (let i = 0; i < 5; i++) result += characters.charAt(Math.floor(Math.random() * charactersLength));
    return result;
}

module.exports.registration = (login, password) => {
    UsersData.push({login: login, password: password, key = ""});
};

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

module.exports.channels_list = (key) {
    let i = 0;
    let len = UsersData.length;
    for (; i < len; i++) if (UsersData[i].key === key) break;
    if (i === len) return false;
    return UsersData[i].channels;
}

module.exports.channels_add = (key, id) {
    let i = 0;
    let len = UsersData.length;
    for (; i < len; i++) if (UsersData[i].key === key) break;
    if (i === len) return false;
    UsersData[i].channels.push(id);
}

module.exports.channels_remove = (key, id) {
    let i = 0;
    let len = UsersData.length;
    for (; i < len; i++) if (UsersData[i].key === key) break;
    if (i === len) return false;
    let cur = UsersData[i];
    for (i = 0; i < cur.channels.length; i++) if (cur.channels[i] === id) {
        cur.channels[i] = false;
        break;
    }
