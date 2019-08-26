'use strict'

const checkAuth = async (accessToken) => {
    return new Promise((resolve, reject) => {
        if (accessToken === undefined) {
            return resolve({ success: false, cause: "Access token did not found" });
        }
        sendRequest("/api/check_token", { token: accessToken }, (response, status) => {
            response = JSON.parse(response);
            if (!response.success)
                return resolve({ success: false, cause: `Wrong access token: ${response.err_cause}` });
            else {
                return resolve({ success: true, userID: response.userID });
            }
        });
    });
}

const getUser = async (userID) => {
    return new Promise((resolve, reject) => {
        sendRequest("/api/get_user", { id: userID }, (response, status) => {
            response = JSON.parse(response);
            if (!response.success)
                return resolve({ success: false, cause: `Error: ${response.err_cause}` });
            else {
                return resolve({ success: true, user: response.user });
            }
        });
    });
}

const getChannel = async (channelID) => {
    return new Promise((resolve, reject) => {
        sendRequest("/api/get_channel", { id: channelID }, (response, status) => {
            response = JSON.parse(response);
            if (!response.success)
                return resolve({ success: false, cause: `Error: ${response.err_cause}` });
            else {
                return resolve({ success: true, channel: response.channel });
            }
        });
    });
}

const init = () => {
    return new Promise(async (resolve, reject) => {
        const token = getCookie("accessToken");
        const authRes = await checkAuth(token);
        if (!authRes.success) {
            console.error(`Authorization failed (${authRes.err_cause})`);
            console.log("Redirect");
            window.location.replace('/auth.html');
            return reject("Unauthorized");
        }
        const userInfo = await getUser(authRes.userID);
        if (!userInfo.success) {
            console.error(`Error (${userInfo.err_cause})`);
            return reject("User loading failed");
        }
        const channelsPromises = [];
        for (let i in userInfo.user.channels)
            if (userInfo.user.channels[i]) //I have no words...
                channelsPromises.push(getChannel(userInfo.user.channels[i]));
        const channels = await Promise.all(channelsPromises);
        return resolve({ success: true, user: userInfo.user, channels: channels });
    });
}

const addMessage = (message, avatar) => {
    const d = new Date(message.time);
    const msgID = `${message.channel_id}_${message.time}`;
    const text = message.message.
        replace(/</g, "&lt;").
        replace(/>/g, "&gt;").
        replace(/"/g, "&quot;");
    document.getElementById("chat_flow").innerHTML +=
        `<div class="msg_box" id=${msgID}>
            <div class="msg_info_zone">
                <div class="msg_icon">
                    <img src="avatars/${avatar}">
                </div>            
            </div>
            <div class="msg_message_zone">
                <div class="name">${message.author_name}</div>
                <div class="msg_time">${d.getHours()}:${d.getMinutes()}</div>
                <div class="msg">${text}</div>
            </div>
        </div>`
    document.getElementById("chat_flow").scrollTop = 9999;
}

const selectChannel = (id) => {
    socketSelectChannel(0); //Exit to the neutral channel
    document.getElementById("chat_flow").innerHTML = "";
    sendRequest("/api/get_messages",
        { token: getCookie("accessToken"), channel_id: id, offset: 0, count: 250 },
        (response, status) => {
            response = JSON.parse(response);
            if (response.success) {
                for (let i = 0; i < response.count; i++) {
                    const cur = response.messages[i];
                    addMessage(cur, "default.png");
                }
            }
            else {
                console.warn(response);
            }
        });
    socketSelectChannel(id);
}