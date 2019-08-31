'use strict'

const API_request = (path, params) => {
    return new Promise((resolve, reject) => {
        request(path, params)
            .then((res) => {
                const response = JSON.parse(res.response);
                if (response.success)
                    return resolve(response);
                else
                    return reject({ code: response.err_code, cause: response.err_cause });
            })
            .catch((err) => {
                return reject(err);
            });
    });
}

const apiExitSession = () => {
    const params = { token: getCookie("accessToken"), };
    return API_request("api/exit_session", params);
}

const apiExitAllSessions = () => {
    const params = { token: getCookie("accessToken"), };
    return API_request("api/exit_all_sessions", params);
}

const apiGetUser = (id) => {
    const params = { id: id };
    return API_request("api/get_user", params);
}

const apiAddToChannel = (user_id, channel_id) => {
    const params = {
        token: getCookie("accessToken"),
        user_id: user_id,
        channel_id: channel_id
    };
    return API_request("api/add_to_channel", params);
}

const apiRemoveFromChannel = (user_id, channel_id) => {
    const params = {
        token: getCookie("accessToken"),
        user_id: user_id,
        channel_id: channel_id
    };
    return API_request("api/remove_from_channel", params);
}

const apiChangeAvatar = (user_id, avatar) => {
    const params = {
        token: getCookie("accessToken"),
        user_id: user_id,
        avatar: avatar
    };
    return API_request("api/change_avatar", params);
}

const apiGetChannel = (channel_id) => {
    const params = { id: channel_id };
    return API_request("api/get_channel", params);
}

const apiCreateChannel = (name) => {
    const params = {
        token: getCookie("accessToken"),
        channel_name: name
    };
    return API_request("api/create_channel", params);
}

const apiDeleteChannel = (ch_id) => {
    const params = {
        token: getCookie("accessToken"),
        channel_id: ch_id
    };
    return API_request("api/delete_channel", params);
}

const apiGetAllChannels = () => {
    const params = { token: getCookie("accessToken") };
    return API_request("api/get_all_channels", params);
}


const apiGetMessages = (ch_id, offset, count) => {
    const params = {
        token: getCookie("accessToken"),
        channel_id: ch_id,
        offset: offset,
        count: count
    };
    return API_request("api/get_messages", params);
}

const apiSendMessage = (ch_id, msg) => {
    const params = {
        token: getCookie("accessToken"),
        channel_id: ch_id,
        message: msg,
    };
    return API_request("api/send_message", params);
}