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
		//MYSQL: Получить запись из users по id
		const cur = users.get(+id);
		if (cur === undefined)
			return ERR_USER_NO_EXIST;
		return { success: true, user: cur };
	}

	this.change_avatar = async (user_id, avatar) => {
		//MYSQL: Изменить значение avatar для записи по id в users
		const cur = users.get(+user_id);
		if (cur === undefined)
			return ERR_USER_NO_EXIST;
		cur.avatar = avatar;
		return { success: true };
	}

	this.add_to_channel = async (user_id, channel_id) => {
		//MYSQL: Изменить значение channels записи по id из users 
		//MYSQL: Изменить значение в party
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

	this.remove_from_channel = async (user_id, channel_id) => {
		//MYSQL: Изменить значение channels записи по id из users
		//MYSQL: Изменить значение в party 
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


	this.get_channel = async (id) => {
		//MYSQL: Получить значение по id из chats
		//MYSQL: Получить значение по id из party
		//Объединить их в один объект: {id,name,owner_id,listeners_ids,meta}
		const cur = channels.get(+id);
		if (cur === undefined) {
			return ERR_CHANNEL_NO_EXIST;
		}
		return { success: true, channel: cur };
	}

	this.create_channel = async (user_id, channel_name) => {
		//MYSQL: Проверить, есть ли запись с таким name в chats
		//MYSQL: Добавить запись к chats
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

	this.channels_delete = async (channel_id) => {
		//MYSQL: Удалить запись из chats по id
		//MYSQL: Пройтись по messages и удалить все сообщения по channel_id
		const channel = channels.get(+channel_id);
		if (channel === undefined)
			return ERR_CHANNEL_NO_EXIST;
		for (let e of channel.listeners_ids)
			users.get(e).channels.filter(e => e !== +channel_id);
		channels.delete(+channel_id);
		return { success: true };
	}


	this.chat_history = async (channel_id, offset, count) => {
		//MYSQL: Получить список сообщений из messages
		//Формируется последовательность сообщений отсортированных по времени отправления
		//Потом, начиная с сообщения offset возвращается не более count сообщений
		//Сейчас в коде ошибка - offset не учитывается
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

	this.send_message = async (channel_id, message, author_id, broadcast) => {
		//MYSQL: Добавить запись в таблицу messages
		const channel = channels.get(+channel_id);
		if (channel === undefined)
			return ERR_CHANNEL_NO_EXIST;
		this.get_user(+author_id).then(user => {
			let newMsg = {
				message_id: messages.get(+channel_id).size,
				author_id: +author_id,
				author_name: user.user.nickname,
				message: message,
				time: new Date().getTime(),
				channel_id: +channel_id
			};
			messages.get(+channel_id).set(newMsg.message_id, newMsg);
			broadcast(+channel_id, newMsg);
			return { success: true };
		});
	}
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
