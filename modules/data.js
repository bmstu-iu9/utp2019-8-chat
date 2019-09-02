'use strict'

const ERR_USER_NO_EXIST = { success: false, err_code: 7, err_cause: "User doesn't exist" };
const ERR_CHANNEL_NO_EXIST = { success: false, err_code: 7, err_cause: "Channel doesn't exist" };

module.exports.init = (database) => {
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
		const channels = await database.getChannels();
		return { success: true, channels: channels };
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
		const msg = await database.addMessage(channel_id, author_id, message);
		broadcast(channel_id, msg);
		return { success: true };
	}
}