'use strict'

const fs = require("fs");

const ERR_USER_NO_EXIST = { success: false, err_code: 7, err_cause: "User doesn't exist" };
const ERR_CHANNEL_NO_EXIST = { success: false, err_code: 7, err_cause: "Channel doesn't exist" };

let users = new Map();
let channels = new Map();
let messages = new Map(); //channel_id -> map

module.exports.create_user = (id, nickname) => {
	const newUser = {
		id: +id,
		nickname: nickname,
		permissions: 0,
		avatar: "avatars/default.png",
		channels: [],
		meta: {}
	};
	users.set(id, newUser);
}

module.exports.get_user = (id) => {
	const cur = users.get(+id);
	if (cur === undefined)
		return ERR_USER_NO_EXIST;
	return { success: true, user: cur };
}

module.exports.change_avatar = (user_id, avatar) => {
	const cur = users.get(+user_id);
	if (cur === undefined)
		return ERR_USER_NO_EXIST;
	cur.avatar = avatar;
	return { success: true };
}

module.exports.add_to_channel = (user_id, channel_id) => {
	const user = users.get(+user_id);
	if (user === undefined)
		return ERR_USER_NO_EXIST;
	const channel = channels.get(+channel_id);
	if (channel === undefined)
		return ERR_CHANNEL_NO_EXIST;

	if (!user.channels.includes(+channel_id))
		user.channels.push(+channel_id);
	if (!channel.listeners_ids.includes(+user_id))
		channel.listeners_ids.push(+user_id);
	return { success: true };
}

module.exports.remove_from_channel = (user_id, channel_id) => {
	const user = users.get(+user_id);
	if (user === undefined)
		return ERR_USER_NO_EXIST;
	const channel = channels.get(+channel_id);
	if (channel === undefined)
		return ERR_CHANNEL_NO_EXIST;

	user.channels = user.channels.filter(e => e !== +channel_id);
	channel.listeners_ids = channel.listeners_ids.filter(e => e !== +user_id);
	return { success: true };
}


module.exports.get_channel = (id) => {
	const cur = channels.get(+id);
	if (cur === undefined) {
		return ERR_CHANNEL_NO_EXIST;
	}
	return { success: true, channel: cur };
}

module.exports.create_channel = (user_id, channel_name) => {
	for (let ch of channels.values()) {
		if (channel_name === ch.name)
			return { success: false, err_code: 3, err_cause: "Channel with this name already exists" };
	}
	const newChannel = {
		id: channels.size + 1,
		name: channel_name,
		owner_id: user_id,
		listeners_ids: [user_id],
		meta: {}
	};
	channels.set(newChannel.id, newChannel);
	messages.set(newChannel.id, new Map());
	users.get(user_id).channels.push(newChannel.id);
	return { success: true };
}

module.exports.channels_delete = (channel_id) => {
	const channel = channels.get(+channel_id);
	if (channel === undefined)
		return ERR_CHANNEL_NO_EXIST;
	for (let e of channel.listeners_ids)
		users.get(e).channels.filter(e => e !== +channel_id);
	channels.delete(+channel_id);
	return { success: true };
}


module.exports.chat_history = (channel_id, offset, count) => {
	const channel = channels.get(+channel_id);
	if (channel === undefined)
		return ERR_CHANNEL_NO_EXIST;
	const msgMap = messages.get(+channel_id);
	let curCount = 0;
	let msgs = [];
	for (let i of Array.from(msgMap.keys()).sort().reverse()) {
		if (curCount >= count)
			break;
		msgs.push(msgMap.get(i));
		curCount++;
	}
	return { success: true, count: curCount, messages: msgs.reverse() };
}

module.exports.send_message = (channel_id, message, author_id, broadcast) => {
	const channel = channels.get(+channel_id);
	if (channel === undefined)
		return ERR_CHANNEL_NO_EXIST;
	let newMsg = {
		message_id: messages.get(+channel_id).size,
		author_id: +author_id,
		author_name: this.get_user(+author_id).user.nickname,
		message: message,
		time: new Date().getTime(),
		channel_id: +channel_id
	};
	messages.get(+channel_id).set(newMsg.message_id, newMsg);
	broadcast(+channel_id, newMsg);
	return { success: true };
}


//Information inside UsersData and UsersChannels, which accumulates during server's session,
//saves into UsersData.json and UsersChannels.json accordingly
module.exports.save = async () => {
	return new Promise((resolve, reject) => {
		fs.writeFile("./Data/users.json", JSON.stringify(Array.from(users.entries())), {}, (err) => {
			if (err)
				return reject(err);
			fs.writeFile("./Data/channels.json", JSON.stringify(Array.from(channels.entries())), (err) => {
				if (err)
					return reject(err);
				for (let e of channels.values()) {
					fs.writeFileSync(`./Data/messages/${e.id}.json`,
						JSON.stringify(Array.from(messages.get(+e.id).entries())));
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
			users = new Map(JSON.parse(raw));
			fs.readFile("./Data/channels.json", (err, raw) => {
				if (raw.length === 0)
					return resolve();
				channels = new Map(JSON.parse(raw));
				messages = new Map();
				for (let e of channels.values()) {
					let raw = fs.readFileSync(`./Data/messages/${e.id}.json`);
					if (raw.length === 0)
						continue;
					else
						messages.set(+e.id, new Map(JSON.parse(raw)));
				}
				return resolve();
			});
		});
	});
}
