'use strict'

const fs = require("fs");

const ERR_USER_NO_EXIST = { success: false, err_code: 7, err_cause: "User doesn't exist" };
const ERR_CHANNEL_NO_EXIST = { success: false, err_code: 7, err_cause: "Channel doesn't exist" };

let users = new Map();
let channels = new Map();
let messages = new Map(); //channel_id -> map

module.exports.init = (database) => {
	this.create_user = async (id, nickname) => {
		//MYSQL: Удаляем
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

	this.get_user = async (id) => {
		if (!await database.doesUserIdExist(id))
			return ERR_USER_NO_EXIST;
		const cur = await database.getUsersMeta(id);
		return { success: true, user: cur };
	}


	this.change_avatar = async (user_id, avatar) => {
		if (!await database.doesUserIdExist(user_id))
			return ERR_USER_NO_EXIST;
		await database.updateAvatar(user_id, avatar);
		return { success: true };
	}

	this.add_to_channel = async (user_id, channel_id) => {
		if (!await database.doesUserIdExist(user_id))
			return ERR_USER_NO_EXIST;
		if (!await database.doesChannelIdExist(channel_id))
			return ERR_CHANNEL_NO_EXIST;
		await database.addUserToChannel(user_id, channel_id);
		return { success: true };
	}

	this.remove_from_channel = async (user_id, channel_id) => {
		if (!await database.doesUserIdExist(user_id))
			return ERR_USER_NO_EXIST;
		if (!await database.doesChannelIdExist(channel_id))
			return ERR_CHANNEL_NO_EXIST;
		if (await database.isUserOwner(user_id, channel_id))
			return { success: false, err_code: -2, err_cause: "You can't leave your own channel" };
		database.removeUserFromChannel(user_id, channel_id);
		return { success: true };
	}


	this.get_channel = async (id) => {
		//Возвращаемый объект: {id,name,owner_id,listeners_ids,meta}
		if (!await database.doesChannelIdExist(id))
			return ERR_CHANNEL_NO_EXIST;
		const channel = await database.getChannelMeta(id);
		return { success: true, channel: channel };
	}

	this.create_channel = async (user_id, channel_name) => {
		if (!await database.doesUserIdExist(user_id))
			return ERR_USER_NO_EXIST;
		if (await database.doesChannelNameExist(channel_name))
			return { success: false, err_code: 3, err_cause: "Channel with this name already exists" };
		await database.addChannel(user_id, channel_name);
		return { success: true };
	}

	this.channels_delete = async (channel_id) => {
		if (!await database.doesChannelIdExist(channel_id))
			return ERR_CHANNEL_NO_EXIST;
		await database.removeChannel(channel_id);
		return { success: true };
	}

	this.get_all_channels = async () => {
		let channels = await database.getChannels();
		return {success: true, channels: channels};
	}

	this.chat_history = async (channel_id, offset, count) => {
		//В возвращаемом массиве хранятся объекты {message_id, chat_id, user_id, content, date_create, author_name}
		//В массие хранятся сначала новые смс, потом старые
		if (!await database.doesChannelIdExist(channel_id))
			return ERR_CHANNEL_NO_EXIST;
		let msgs = await database.getMessagesHistory(channel_id, offset, count);
		return { success: true, count: msgs.length, messages: msgs };
	}

	this.send_message = async (channel_id, message, author_id, broadcast) => {
		if (!await database.doesChannelIdExist(channel_id))
			return ERR_CHANNEL_NO_EXIST;
		let msg = await database.addMessage(channel_id, author_id, message);
		broadcast(channel_id, msg);
		return { success: true };
	}
}

//Information inside UsersData and UsersChannels, which accumulates during server's session,
//saves into UsersData.json and UsersChannels.json accordingly
module.exports.save = async () => {
	// return new Promise((resolve, reject) => {
	// 	fs.writeFile("./Data/users.json", JSON.stringify(Array.from(users.entries())), {}, (err) => {
	// 		if (err)
	// 			return reject(err);
	// 		fs.writeFile("./Data/channels.json", JSON.stringify(Array.from(channels.entries())), (err) => {
	// 			if (err)
	// 				return reject(err);
	// 			for (let e of channels.values()) {
	// 				fs.writeFileSync(`./Data/messages/${e.id}.json`,
	// 					JSON.stringify(Array.from(messages.get(+e.id).entries())));
	// 			}
	// 			return resolve();
	// 		});
	// 	});
	// });
}

//Loading information, that had been recording during previous server's sessions,
//from UsersData.json and UsersChannels.json to UsersData and UsersChannels respectively
module.exports.load = async () => {
	// return new Promise((resolve, reject) => {
	// 	fs.readFile("./Data/users.json", (err, raw) => {
	// 		if (err)
	// 			return reject(err);
	// 		if (raw.length === 0)
	// 			return resolve();
	// 		users = new Map(JSON.parse(raw));
	// 		fs.readFile("./Data/channels.json", (err, raw) => {
	// 			if (raw.length === 0)
	// 				return resolve();
	// 			channels = new Map(JSON.parse(raw));
	// 			messages = new Map();
	// 			for (let e of channels.values()) {
	// 				let raw = fs.readFileSync(`./Data/messages/${e.id}.json`);
	// 				if (raw.length === 0)
	// 					continue;
	// 				else
	// 					messages.set(+e.id, new Map(JSON.parse(raw)));
	// 			}
	// 			return resolve();
	// 		});
	// 	});
	// });
}