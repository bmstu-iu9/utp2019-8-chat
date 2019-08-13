'use-strict'

const fs = require("fs");

let UsersData = [];
let UsersChannels = [false];
/*
const makeSessionKey = () => {
    let result = "";
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let charactersLength = characters.length;
    for (let i = 0; i < 5; i++) result += characters.charAt(Math.floor(Math.random() * charactersLength));
    return result;
}

//Function for checking session key
const checkSessionKey = (key) => {
	let i = 0;
    let len = UsersData.length;
    for (; i < len; i++) if (UsersData[i].key === key) break;
    if (i === len) return false;
	return i;
}

//Registration new user
module.exports.registration = (login, password, name) => {
    if (login.length < 2 || password.length < 6 || name.length < 1) return false;
	
    //Checking, if login occupied
    for (let i = 0, i < UsersData.length; i++) if (UsersData[i].login === login) return false;
	
    UsersData.push({login: login, password: password, key: "", channels: [], author_name: name, id: UsersData.length});
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
*/

module.exports.get_user = (id) => {
	if (arguments.length < 1) return {success: false, err_code: 1, err_cause: "undefined arguments exist"};
	if (typeof(id) !== "number") return {success: false, err_code: 2, err_cause: "wrong type of argument"};
	let current = UsersData[id];
	if (typeof(current) === "undefined") return {success: false, err_code: 7, err_cause: "user doesn't exist"};
	return {success: true, user: current};
}	

module.exports.channels_list = (key) => {
	let i = checkSessionKey(key);
    if (i === false) return false;
    return UsersData[i].channels;
}

module.exports.channels_add = (key, id) => {
    let i = checkSessionKey(key);
    if (i === false) return false;
    UsersData[i].channels.push(id);
	return true;
}

module.exports.channels_remove = (key, id) => {
    let i = checkSessionKey(key);
    if (i === false) return false;

    let cur = UsersData[i];
    for (i = 0; i < cur.channels.length; i++) if (cur.channels[i] === id) {
        cur.channels[i] = false;
        break;
    }
    return true;
}

module.exports.channels_create = (key, name) => {
    let i = checkSessionKey(key);
    if (i === false) return false;

    UsersChannels.push({id: UsersChannels.length, name: name, messages: []});
    return UsersChannels.length - 1;
}

module.exports.channels_delete = (key, id) => {
    let i = checkSessionKey(key);
    if (i === false) return false;

    UsersChannels[id] = false;
	return true;
}

module.exports.chat_history = (key, id, count, offset) => {
    let i = checkSessionKey(key);
    if (i === false) return false;

    let start = 0;
    let end = 0;
    len = UsersChannels[id].messages.length;
    if (offset < len) {
        end = len - offset;
        if (offset + count < len) start = len - offset - count;
    }
    //Returning number of messages and themselves messages
    return [end - start, UsersChannels[id].messages.slice(start, end)];
}

module.exports.send_message = (key, id, message) => {
    let i = checkSessionKey(key);
    if (i === false) return false;

    UsersChannels[id].messages.push({message_id: UsersChannels[id].messages.length, author_id: UsersData[i].id, author_name: UsersData[i].author_name, message: message});
    return UsersChannels[id].messages[UsersChannels[id].messages.length - 1];
}

//Information inside UsersData and UsersChannels, which accumulates during server's session,
//saves into UsersData.json and UsersChannels.json accordingly
module.exports.save = () => {
    if (UsersData.length > 0) {
		fs.writeFileSync("./Data/UsersData.json", JSON.stringify(UsersData[0]));
		fs.appendFileSync("./Data/UsersData.json", "\n");
	}
    for (let i = 1; i < UsersData.length; i++) {
        fs.appendFileSync("./Data/UsersData.json", JSON.stringify(UsersData[i]));
		if (i < UsersData.length - 1) fs.appendFileSync("./Data/UsersData.json", "\n");
    }
    if (UsersChannels.length > 0) {
		fs.writeFileSync("./Data/UsersChannels.json", JSON.stringify(UsersChannels[0]));
		fs.appendFileSync("./Data/UsersChannels.json", "\n");
	}
    for (let i = 1; i < UsersChannels.length; i++) {
        fs.appendFileSync("./Data/UsersChannels.json", JSON.stringify(UsersChannels[i]));
		if (i < UsersChannels.length - 1) fs.appendFileSync("./Data/UsersChannels.json", "\n");
    }
}

//Loading information, that had been recording during previous server's sessions,
//from UsersData.json and UsersChannels.json to UsersData and UsersChannels respectively
module.exports.load = (callback) => {
    let current = readline.createInterface({input: fs.createReadStream("./Data/UsersData.json")});
    current.on('line', (line) => {
        if (line.length > 5) UsersData.push(JSON.parse(line));
    });
    current.on('close', () => {
        let current_1 = readline.createInterface({input: fs.createReadStream("./Data/UsersChannels.json")});
        current_1.on('line', (line) => {
            if (line.length > 5) UsersChannels.push(JSON.parse(line));
        });
        current_1.on('close', () => {
            callback();
        });
    });
}
