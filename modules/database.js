'use strict'

const mysql = require("mysql");

const db = mysql.createConnection({
	host: 'remotemysql.com',
	user: '9SpT1uQOyM',
	password: 'utp2019password',
	database: '9SpT1uQOyM'
});

db.connect((err) => {
	if (err) {
		console.log("Connection error");
		throw err;
	}
	console.log("Connected");
});

const loadUsersData = () => {
	let sql = "select * from users";
	let query = db.query(sql, (err, results) => {
		if (err)
			throw err;
		console.log(results);
		return results;
	});
}

const getUserName = (id) => {
	return new Promise((resolve, reject) => {
		let sql = "select * from users_data where id = ?";
		let params = [id];
		let query = db.query(sql, params, (err, result) => {
			if (err)
				return reject(err);
			return resolve(result[0][`nickname`]);
		});
	});
}

module.exports.getUser = (login) => {
	return new Promise((resolve, reject) => {
		let params = [login];
		let sql = "select * from users where login = ?";
		let query = db.query(sql, params, (err, result) => {
			if (err)
				return reject(err);
			return resolve(result[0]);
		});
	});
}

module.exports.getUsersMeta = (id) => {
	return new Promise((resolve, reject) => {
		let user_id = -1, nickname = "", permission = -1, avatar = "", channels = [], meta = {};
		let params = [id];
		let sql = "select * from users_data where id = ?";
		let query = db.query(sql, params, (err, result) => {
			if (err)
				return reject(err);
			user_id = result[0][`id`];
			nickname = result[0][`nickname`];
			permission = result[0][`permissions`];
			avatar = result[0][`avatar`];
			meta = result[0][`meta`];

			sql = "select * from party where user_id = ?";
			let query1 = db.query(sql, params, (err, result) => {
				if (err)
					return reject(err);
				for (let i = 0; i < result.length; i++)
					channels[i] = result[i][`chat_id`];

				const user = {
					id: user_id,
					nickname: nickname,
					permissions: permission,
					avatar: avatar,
					channels: channels,
					meta: meta
				};
				return resolve(user);
			});
		});
	});
}

module.exports.getChannelMeta = (id) => {
	return new Promise((resolve, reject) => {
		let channel_id = -1, channel_name = "", owner_id = -1, listeners = [], meta = {};
		let sql = "select * from chat where chat_id = ?";
		let params = [id];
		let query = db.query(sql, params, (err, result) => {
			if (err)
				return reject(err);
			channel_id = result[0][`chat_id`];
			channel_name = result[0][`name`];
			owner_id = result[0][`user_id`];
			meta = result[0][`meta`];

			sql = "select * from party where chat_id = ?";
			let query1 = db.query(sql, params, (err, result) => {
				if (err)
					return reject(err);
				for (let i = 0; i < result.length; i++)
					listeners[i] = result[i][`user_id`];
				const channel = {
					id: channel_id,
					name: channel_name,
					owner_id: owner_id,
					listeners_ids: listeners,
					meta: meta
				};
				return resolve(channel);
			});
		});
	});
}

module.exports.getMessagesHistory = (channel_id, offset, count) => {
	return new Promise((resolve, reject) => {
		let history = [];
		let params = [channel_id];
		let sql = "select * from messages where chat_id = ? ORDER BY `messages`.`date_create` DESC";
		let query = db.query(sql, params, async (err, result) => {
			if (err)
				return reject(err);
			for (let i = offset; history.length < count && i < result.length; i++) {
				let msg = {
					message_id: result[i][`message_id`],
					chat_id: channel_id,
					author_id: result[i][`user_id`],
					message: result[i][`content`],
					time: result[i][`date_create`],
					author_name: await getUserName(result[i][`user_id`])
				};
				history.push(msg);
			}
			return resolve(history);
		});
	});
}

module.exports.addUser = (login, hash, salt) => {
	return new Promise((resolve, reject) => {
		let post = { login: login, hash: hash, salt: salt };
		let sql = "insert into users set ?";
		let id = -1;
		let query = db.query(sql, post, (err, result) => {
			if (err)
				return reject(err);
			sql = "select LAST_INSERT_ID()";
			let query1 = db.query(sql, (err, result) => {
				if (err)
					return reject(err);
				for (let key in result[0]) {
					id = result[0][key];
					break;
				}
				post = { id: id, nickname: login };
				sql = "insert into users_data set ?";
				let query2 = db.query(sql, post, (err, result) => {
					if (err)
						return reject(err);
					else
						return resolve(id);
				});
			});
		});
	});
}

module.exports.addChannel = (user_id, name) => {
	return new Promise((resolve, reject) => {
		let post = { name: name, user_id: user_id };
		let sql = "insert into chat set ?";
		let query = db.query(sql, post, (err, result) => {
			if (err)
				return reject(err);
			let chat_id = -1;
			sql = "select LAST_INSERT_ID()";
			let query1 = db.query(sql, (err, result) => {
				if (err)
					return reject(err);
				for (let key in result[0]) {
					chat_id = result[0][key];
					break;
				}
				post = { chat_id: chat_id, user_id: user_id };
				sql = "insert into party set ?";
				let query2 = db.query(sql, post, (err, result) => {
					if (err)
						return reject(err);
					return resolve();
				});
			});
		});
	});
}

module.exports.addMessage = (channel_id, author_id, message) => {
	return new Promise(async (resolve, reject) => {
		let message_id = -1, author_name = await getUserName(author_id), time = new Date();
		let post = { chat_id: channel_id, user_id: author_id, content: message, date_create: time };
		let sql = "insert into messages set ?";
		let query = db.query(sql, post, (err, result) => {
			if (err)
				return reject(err);
			sql = "select LAST_INSERT_ID()";
			let query1 = db.query(sql, (err, result) => {
				if (err)
					return reject(err);
				for (let key in result[0]) {
					message_id = result[0][key];
					break;
				}
				let msg = {
					message_id: message_id,
					author_id: author_id,
					author_name: author_name,
					message: message,
					time: time,
					channel_id: channel_id
				};
				return resolve(msg);
			});
		});
	});
}

module.exports.updateAvatar = (id, avatar) => {
	return new Promise((resolve, reject) => {
		let params = [avatar, id];
		let sql = "update users_data set avatar = ? where id = ?";
		let query = db.query(sql, params, (err, result) => {
			if (err)
				return reject(err);
			return resolve();
		});
	});
}

module.exports.addUserToChannel = (user_id, channel_id) => {
	return new Promise((resolve, reject) => {
		let post = { chat_id: channel_id, user_id: user_id };
		let sql = "insert into party set ?";
		let query = db.query(sql, post, (err, result) => {
			if (err)
				return reject(err);
			return resolve();
		});
	});
}

module.exports.removeUserFromChannel = (user_id, channel_id) => {
	return new Promise((resolve, reject) => {
		let sql = "delete from party where chat_id = ? and user_id = ?";
		let params = [channel_id, user_id];
		let query = db.query(sql, params, (err, result) => {
			if (err)
				return reject(err);
			return resolve();
		});
	});
}

module.exports.removeChannel = (channel_id) => {
	return new Promise((resolve, reject) => {
		let sql = "delete from party where chat_id = ?";
		let params = [channel_id];
		let query = db.query(sql, params, (err, result) => {
			if (err)
				return reject(err);
			sql = "delete from messages where chat_id = ?";
			let query1 = db.query(sql, params, (err, result) => {
				if (err)
					return reject(err);
				sql = "delete from chat where chat_id = ?";
				let query2 = db.query(sql, params, (err, result) => {
					if (err)
						return reject(err);
					return resolve();
				});
			});

		});
	});
}

module.exports.isUserOwner = (user_id, channel_id) => {
	return new Promise((resolve, reject) => {
		let sql = "select * from chat where chat_id = ? and user_id = ?";
		let params = [channel_id, user_id];
		let query = db.query(sql, params, (err, result) => {
			if (err)
				return reject(err);
			if (result.length == 0)
				return resolve(false);
			else
				return resolve(true);
		});
	});
}

const updateLogin = (id, login) => {
	let sql = "update users set login = " + "'" + login + "'" + " where id = " + id;
	let query = db.query(sql, (err, result) => {
		if (err)
			throw err;
	});
}

const updateHash = (id, hash) => {
	let sql = "update users set hash = " + "'" + hash + "'" + " where id = " + id;
	let query = db.query(sql, (err, result) => {
		if (err)
			throw err;
	});
}

const updateSalt = (id, salt) => {
	let sql = "update users set salt = " + "'" + salt + "'" + " where id = " + id;
	let query = db.query(sql, (err, result) => {
		if (err)
			throw err;
	});
}

const updateNickname = (id, nickname) => {
	let sql = "update users_data set nickname = " + "'" + nickname + "'" + " where id = " + id;
	let query = db.query(sql, (err, result) => {
		if (err)
			throw err;
	});
}

const updatePremission = (id, permission) => {
	let sql = "update users_data set permission = " + permission + " where id = " + id;
	let query = db.query(sql, (err, result) => {
		if (err)
			throw err;
	});
}

module.exports.doesChannelIdExist = (id) => {
	return new Promise((resolve, reject) => {
		let sql = "select * from chat where chat_id = ?";
		let params = [id];
		let query = db.query(sql, params, (err, result) => {
			if (err)
				return reject(err);
			if (result.length == 0)
				return resolve(false);
			else
				return resolve(true);
		});
	});
}

module.exports.doesUserIdExist = (id) => {
	return new Promise((resolve, reject) => {
		let sql = "select * from users where id = ?";
		let params = [id];
		let query = db.query(sql, params, (err, result) => {
			if (err)
				return reject(err);
			if (result.length == 0)
				return resolve(false);
			else
				return resolve(true);
		});
	});
}

module.exports.doesUserExist = (login) => {
	return new Promise((resolve, reject) => {
		let sql = "select * from users where login = ?";
		let params = [login];
		let query = db.query(sql, params, (err, result) => {
			if (err)
				return reject(err);
			if (result.length == 0)
				return resolve(false);
			else
				return resolve(true);
		});
	});
}

module.exports.doesChannelNameExist = (name) => {
	return new Promise((resolve, reject) => {
		let sql = "select * from chat where name = ?";
		let params = [name];
		let query = db.query(sql, params, (err, result) => {
			if (err)
				return reject(err);
			if (result.length == 0)
				return resolve(false);
			else
				return resolve(true);
		});
	});
}