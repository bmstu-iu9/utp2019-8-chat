'use strict'

const fs = require("fs");

const ERR_USER_NO_EXIST = { success: false, err_code: 7, err_cause: "User doesn't exist" };
const ERR_CHANNEL_NO_EXIST = { success: false, err_code: 7, err_cause: "Channel doesn't exist" };

let UsersData = [];
let UsersChannels = [false];
let messages = [];


module.exports.create_user = (id, nickname) => {
	let newUser = {
		id: id,
		nickname: nickname,
		permissions: 0,
		avatar: "default.png",
		channels: [],
		meta: {}
	};
	UsersData[id] = newUser;
}

module.exports.get_user = (id) => {
	let current = UsersData[id];
	if (current === undefined) {
		return ERR_USER_NO_EXIST;
	}
	return { success: true, user: current };
}

module.exports.change_avatar = (user_id, avatar) => {
	if (UsersData[user_id] === undefined) {
		return ERR_USER_NO_EXIST;
	}
	UsersData[user_id].avatar = avatar;
	return { success: true };
}

module.exports.add_to_channel = (user_id, channel_id) => {
	if (UsersData[user_id] === undefined) {
		return ERR_USER_NO_EXIST;
	}
	if (UsersChannels[channel_id] === undefined) {
		return ERR_CHANNEL_NO_EXIST;
	}
	UsersData[user_id].channels.push(+channel_id);
	UsersChannels[channel_id].listeners_ids.push(+user_id);
	return { success: true };
}

module.exports.remove_from_channel = (user_id, channel_id) => {
	if (UsersData[user_id] === undefined) {
		return ERR_USER_NO_EXIST;
	}
	if (UsersChannels[channel_id] === undefined) {
		return ERR_CHANNEL_NO_EXIST;
	}
	UsersData[user_id].channels[UsersData[user_id].channels.indexOf(+channel_id)] = false;
	for (let i = 0; i < UsersChannels[channel_id].listeners_ids.length; i++) {
		if (UsersChannels[channel_id].listeners_ids[i] === +user_id) {
			UsersChannels[channel_id].listeners_ids[i] = false;
			break;
		}
	}
	return { success: true };
}


module.exports.get_channel = (id) => {
	let current = UsersChannels[id];
	if (current === undefined) {
		return ERR_CHANNEL_NO_EXIST;
	}
	return { success: true, channel: current };
}

module.exports.create_channel = (user_id, channel_name) => {
	for (let i = 1; i < UsersChannels.length; i++) {
		if (UsersChannels[i].name === channel_name) {
			return { success: false, err_code: 3, err_cause: "Channel with this name already exists" };
		}
	}
	UsersData[user_id].channels.push(UsersChannels.length);
	let newChannel = {
		id: UsersChannels.length,
		name: channel_name,
		owner_id: user_id,
		listeners_ids: [user_id],
		last_message_id: undefined,
		last_message_time: undefined,
		meta: {}
	};
	UsersChannels.push(newChannel);
	messages[newChannel.id] = [];
	return { success: true };
}

module.exports.channels_delete = (channel_id) => {
	if (UsersChannels[channel_id] === undefined) {
		return ERR_CHANNEL_NO_EXIST;
	}
	for (let i = 0; i < UsersChannels[channel_id].listeners_ids.length; i++) {
		for (let j = 0; j < UsersData[i].channels.length; j++) {
			if (UsersData[i].channels[j].id === channel_id) {
				UsersData[i].channels[j] = false;
				break;
			}
		}
	}
	UsersChannels[channel_id] = false;
	return { success: true };
}


module.exports.chat_history = (channel_id, offset, count) => {
	if (UsersChannels[channel_id] === undefined) {
		return ERR_CHANNEL_NO_EXIST;
	}
	let start = 0;
	let end = 0;
	let len = messages[channel_id].length;
	if (offset < len) {
		end = len - offset;
		if (offset + count < len)
			start = len - offset - count;
	}
	return {
		success: true,
		count: end - start,
		messages: messages[channel_id].slice(start, end)
	};
}

module.exports.send_message = (channel_id, message, author_id, broadcast) => {
	if (UsersChannels[channel_id] === undefined) {
		return ERR_CHANNEL_NO_EXIST;
	}
	let newMsg = {
		message_id: messages[channel_id].length,
		author_id: author_id,
		author_name: this.get_user(author_id).user.nickname,
		message: message,
		time: new Date().getTime(),
		channel_id: channel_id
	};
	messages[channel_id].push(newMsg);
	broadcast(channel_id, newMsg);
	return { success: true };
}


//Information inside UsersData and UsersChannels, which accumulates during server's session,
//saves into UsersData.json and UsersChannels.json accordingly
module.exports.save = async () => {
	return new Promise((resolve, reject) => {
		fs.writeFile("./Data/users.json", JSON.stringify(UsersData), {}, (err) => {
			if (err)
				return reject(err);
			fs.writeFile("./Data/channels.json", JSON.stringify(UsersChannels), (err) => {
				if (err)
					return reject(err);
				for (let i in UsersChannels) {
					if (UsersChannels[i]) {
						fs.writeFileSync(
							`./Data/messages/${UsersChannels[i].id}.json`,
							JSON.stringify(messages[UsersChannels[i].id]));
					}
				}
				return resolve();
			});
		});
	});
}

//Loading information, that had been recording during previous server's sessions,
//from UsersData.json and UsersChannels.json to UsersData and UsersChannels respectively
module.exports.load = async () => {
	return new Promise((resolve, reject) => {
		fs.readFile("./Data/users.json", (err, raw) => {
			if (err)
				return reject(err);
			if (raw.length === 0)
				return resolve();
			UsersData = JSON.parse(raw);
			fs.readFile("./Data/channels.json", (err, raw) => {
				if (raw.length === 0)
					return resolve();
				UsersChannels = JSON.parse(raw);
				for (let i in UsersChannels) {
					if (UsersChannels[i]) {
						let raw = fs.readFileSync(`./Data/messages/${UsersChannels[i].id}.json`);
						if (raw.length === 0)
							messages[UsersChannels[i].id] = [];
						else
							messages[UsersChannels[i].id] = JSON.parse(raw);
					}
				}
				return resolve();
			});
		});
	});
}
