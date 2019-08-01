'use-strict'

const fs = require("fs");

class Message {
    constructor(message_id, author_id, author_name, message) {
        this.message_id = message_id;
        this.author_id = author_id;
        this.author_name = author_name;
        this.message = message;
    }

    get message_id() {
        return message_id;
    }
    get author_id() {
        return author_id;
    }
    get author_name() {
        return author_name;
    }
    get message() {
        return message;
    }

    set message_id(value) {
        message_id = value;
    }
    set author_id(value) {
        author_id = value;
    }
    set author_name(value) {
        author_name = value;
    }
    set message(value) {
        message = value;
    }
}

class Channel {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }

    get id() {
        return id;
    }
    get name() {
        return name;
    }

    set id(value) {
        id = value;
    }
    set name(value) {
        name = value;
    }
}

let UsersData = [];

const makeSessionKey() {
    let result = "";
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let charactersLength = characters.length;
    for (let i = 0; i < 5; i++) result += characters.charAt(Math.floor(Math.random() * charactersLength));
    return result;
}

module.exports.registration = (login, password) => {
    UsersData.push([login, password, ""]);
};

module.exports.authentication = (login, password) => {
    let i = 0;
    let len = UsersData.length;
    for (; i < len; i++) {
        let cur = UsersData[i];
        if (cur[0] === login) {
            if (cur[1] === password) break;
            else return false;
        }
    }
    if (i === len) return false;
    let key = makeSessionKey();
    UsersData[i][2] = key;
    return key;
}








