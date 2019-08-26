'use strict'

let usersCache = new Map();

//Load and return data about the user and his channels
const init = () => {
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
        let channels = [];
        for (let i in userInfo.user.channels)
            if (userInfo.user.channels[i])
                channels.push(getChannel(userInfo.user.channels[i]));
        channels = await Promise.all(channels);
        return resolve({ success: true, user: userInfo.user, channels: channels });
    });
}

//Create new message div
const createMessage = (message) => {
    const getAuthor = (id) => {
        return new Promise((resolve, reject) => {
            let saved = usersCache.get(message.author_id);
            if (saved !== undefined)
                return resolve(saved);
            else {
                sendRequest("/api/get_user", { id: message.author_id }, (response, status) => {
                    response = JSON.parse(response);
                    if (response.success) {
                        usersCache.set(message.author_id, response.user);
                        return resolve(response.user);
                    }
                    else {
                        return reject(response);
                    }
                });
            }
        });
    }
    return new Promise(async (resolve, reject) => {
        const author = await getAuthor(message.author_id);
        const d = new Date(message.time);
        const msgID = `${message.channel_id}_${message.time}`;
        const text = message.message.
            replace(/</g, "&lt;").
            replace(/>/g, "&gt;").
            replace(/"/g, "&quot;");
        const node =
            `<div class="msg_box" id=${msgID}>
                <div class="msg_info_zone">
                    <div class="msg_icon">
                        <img src="${author.avatar}">
                    </div>            
                </div>
                <div class="msg_message_zone">
                    <div class="name">${author.nickname}</div>
                    <div class="msg_time">${d.getHours()}:${d.getMinutes()}</div>
                    <div class="msg">${text}</div>
                </div>
            </div>`
        return resolve(node);
    });
}

//Change channel
const selectChannel = async (id) => {
    const loadMessages = (id) => {
        return new Promise((resolve, reject) => {
            sendRequest("/api/get_messages", { token: getCookie("accessToken"), channel_id: id, offset: 0, count: 250 },
                async (response, status) => {
                    response = JSON.parse(response);
                    if (response.success && response.count >= 0) {
                        let builder = "";
                        for (let i = 0; i < response.count; i++)
                            builder += await createMessage(response.messages[i]);
                        return resolve(builder);
                    }
                    else {
                        console.warn(response);
                        return reject(response);
                    }
                });
        });
    }
    socketSelectChannel(0); //Exit to the neutral channel
    document.getElementById("chat_flow").innerHTML = "Loading";
    console.time("Messages loading");
    document.getElementById("chat_flow").innerHTML = await loadMessages(id);
    console.timeEnd("Messages loading");
    document.getElementById("chat_flow").scrollTop = 9999;
    socketSelectChannel(id);
}