'use strict'

//Load and return data about the user and his channels
const init = () => {
    return new Promise((resolve, reject) => {
        apiCheckToken()
            .then(async (userID) => {
                const userInfo = await apiGetUser(userID);
                let channels = [];
                for (let i in userInfo.user.channels)
                    if (userInfo.user.channels[i])
                        channels.push(await apiGetChannel(userInfo.user.channels[i]));
                return resolve({ success: true, user: userInfo.user, channels: channels });
            })
            .catch((err) => {
                console.error(`Authorization failed (${err})`);
                console.log("Redirect");
                window.location.replace('/auth.html');
                return reject("Unauthorized");
            });
    });
}

//Create new message div
const createMessage = (message, cache) => {
    const getAuthor = () => {
        return new Promise((resolve, reject) => {
            let saved = cache.get(message.author_id);
            if (saved !== undefined)
                return resolve(saved);
            else {
                apiGetUser(message.author_id)
                    .then((res) => {
                        cache.set(message.author_id, res.user);
                        return resolve(res.user);
                    })
                    .catch((err) => {
                        return reject(err);
                    });
            }
        });
    }
    return new Promise(async (resolve, reject) => {
        const author = cache !== undefined ? await getAuthor() : await apiGetUser(message.author_id).user;
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
            apiGetMessages(id, 0, 250)
                .then(async (res) => {
                    let usersCache = new Map();
                    let builder = "";
                    for (let i = 0; i < res.count; i++)
                        builder += await createMessage(res.messages[i], usersCache);
                    return resolve(builder);
                })
                .catch((err) => {
                    console.warn(err);
                    return reject(err);
                });
        });
    }
    socketSelectChannel(0); //Exit to the neutral channel
    document.getElementById("chat_flow").innerHTML = "Loading";
    document.getElementById("chat_flow").innerHTML = await loadMessages(id);
    document.getElementById("chat_flow").scrollTop = 9999;
    socketSelectChannel(id);
}