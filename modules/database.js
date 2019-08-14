'use strict'

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

module.exports.add_to_channel = (user_id, channel_id) => {
    if (arguments.length < 2) return {success: false, err_code: 1, err_cause: "undefined arguments exist"};
	if (typeof(user_id) !== "number" || typeof(channel_id) !== "number") return {success: false, err_code: 2, err_cause: "wrong type of argument"};
	if (typeof(UsersData[user_id]) === "undefined") return {success: false, err_code: 7, err_cause: "user doesn't exist"};
	if (typeof(UsersChannels[channel_id]) === "undefined") return {success: false, err_code: 7, err_cause: "channel doesn't exist"};
	UsersData[user_id].channels.push(channel_id);
	UsersChannels[channel_id].listeners_ids.push(user_id);
	return {success: true};
}

module.exports.remove_from_channel = (user_id, channel_id) => {
    if (arguments.length < 2) return {success: false, err_code: 1, err_cause: "undefined arguments exist"};
	if (typeof(user_id) !== "number" || typeof(channel_id) !== "number") return {success: false, err_code: 2, err_cause: "wrong type of argument"};
	if (typeof(UsersData[user_id]) === "undefined") return {success: false, err_code: 7, err_cause: "user doesn't exist"};
	if (typeof(UsersChannels[channel_id]) === "undefined") return {success: false, err_code: 7, err_cause: "channel doesn't exist"};
    UsersData[user_id].channels[channel_id] = false;
	for (let i = 0, i < UsersChannels[channel_id].listeners_ids.length; i++) {
		if (UsersChannels[channel_id].listeners_ids[i] === user_id) {
			UsersChannels[channel_id].listeners_ids[i] = false;
			break;
		}
	}
	return {success: true};
}

module.exports.get_channel = (id) => {
	if (arguments.length < 1) return {success: false, err_code: 1, err_cause: "undefined arguments exist"};
	if (typeof(id) !== "number") return {success: false, err_code: 2, err_cause: "wrong type of argument"};
	let current = UsersChannels[id];
	if (typeof(current) === "undefined") return {success: false, err_code: 7, err_cause: "channel doesn't exist"};
    return {success: true, channel = current};
}

module.exports.create_channel = (user_id, channel_name) => {
     if (arguments.length < 2) return {success: false, err_code: 1, err_cause: "undefined arguments exist"};
     if (typeof(user_id) !== "number" || typeof(channel_name) !== "string") return {success: false, err_code: 2, err_cause: "wrong type of argument"};
     for (let i = 1; i < UsersChannels.length; i++) if (UsersChannels[i].name === channel_name) return {success: false, err_code: 3, err_cause: "channel with this name already exists"};
     UsersData[user_id].channels.push(UsersChannels.length);
	 UsersChannels.push({id: UsersChannels.length, name: channel_name, owner_id: user_id, listeners_ids: {user_id}, last_message_id: undefined, last_message_time: undefined}); 
	 return {success: true};
}					

module.exports.channels_delete = (channel_id) => {
    if (arguments.length < 2) return {success: false, err_code: 1, err_cause: "undefined arguments exist"};
     if (typeof(channel_id) !== "number") return {success: false, err_code: 2, err_cause: "wrong type of argument"};
	if (UsersChannels.length <= channel_id) return {success: false, err_code: 7, err_cause: "channel doesn't exist"};
     for (let i = 0; i < UsersChannels[channel_id].listeners_ids.length; i++) {
		 for (let j = 0; j < UsersData[i].channels.length; j++) {
			 if (UsersData[i].channels[j].id === channel_id) {
				 UsersData[i].channels[j] = false;
				 break;
			 }
		 }
	 }
	 UsersChannels[channel_id] = false;
	 return {success: true};
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
