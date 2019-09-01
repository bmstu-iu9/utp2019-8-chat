'use strict'

let currentChannelId, currentChannelName;

//Load and return data about the user and his channels
const init = () => {
    return new Promise((resolve, reject) => {
        apiCheckToken()
            .then(async (userID) => {
                const userInfo = await apiGetUser(userID);
                let channels = [];
                if ((userInfo.user.permissions & 2) == 0) {
                    for (let i in userInfo.user.channels)
                        if (userInfo.user.channels[i])
                            channels.push(await apiGetChannel(userInfo.user.channels[i]));
                    channels = channels.map(e => e.channel);
                }
                else
                    channels = (await apiGetAllChannels()).channels;
                return resolve({ success: true, user: userInfo.user, channels: channels });
            })
            .catch((err) => {
                console.error(`Authorization failed (${err})`);
                window.location.replace('/auth.html');
                return reject("Unauthorized");
            });
    });
}

//Create new message div
const createMessage = (message, cache, mention) => {
    const getAuthor = () => {
        return new Promise((resolve, reject) => {
            if (cache === undefined) {
                apiGetUser(message.author_id)
                    .then(res => resolve(res.user))
                    .catch(err => reject(err));
            }
            else {
                let saved = cache.get(message.author_id);
                if (saved !== undefined)
                    return resolve(saved);
                else {
                    apiGetUser(message.author_id)
                        .then(res => {
                            cache.set(message.author_id, res.user);
                            return resolve(res.user);
                        })
                        .catch(err => reject(err));
                }
            }
        });
    }

    const prepareText = (raw) => {
        raw = raw.trim();
        raw = raw.replace(/^(<span>|<div>|<br \/>|<br\/>|<span\/>|<\/div>)+(.*)(<span>|<div>|<br \/>|<br\/>|<span\/>|<\/div>)+$/gmi, '$2');
        raw = raw.replace(/</g, "&lt;");
        raw = raw.replace(/>/g, "&gt;");
        raw = raw.replace(/"/g, "&quot;");
        raw = raw.replace(/(?:\r\n|\r|\n)/g, '<br />');
        raw = raw.replace(new RegExp(`@${current_user.nickname}`, 'g'), `<span class="mention">@${current_user.nickname}</span>`);
        return raw;
    }

    return new Promise(async (resolve, reject) => {
        const author = await getAuthor();
        const d = new Date(message.time);
        const text = prepareText(message.message);
        const colored = (author.permissions & 4) !== 0 ? "colored_nickname" : "common_nickname";
        const ment = `document.getElementById('text').value += ' @${author.nickname}';`;
        const node =
            `<div class="msg_box" id="${message.channel_id}_${message.time}">
                <div class="msg_info_zone">
                    <div class="msg_icon">
                        <img src="${author.avatar}">
                    </div>
                </div>
                <div class="msg_message_zone">
                    <span class=${colored}><div class="name" onclick="${ment}">${author.nickname}</div></span>
                    <div class="msg_time">${d.getHours()}:${(d.getMinutes() < 10 ? '0' : '') + d.getMinutes()}</div>
                    <div class="msg">${text}</div>
                </div>
            </div>`;
        if (mention !== undefined && text.indexOf(`@${current_user.nickname}`) >= 0)
            mention(author.nickname, message.message);
        return resolve(node);
    });
}

//Change channel
const selectChannel = async (id) => {
    const loadMessages = (id) => {
        return new Promise((resolve, reject) => {
            apiGetMessages(id, 0, 500) //Show last 500 messages
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
    currentChannelId = 0;
    document.getElementById("chat_flow").innerHTML = "Loading";
    document.getElementById("chat_flow").innerHTML = await loadMessages(id);
    document.getElementById("chat_flow").scrollTop = 99999;
    socketSelectChannel(id);
    currentChannelId = id;
    apiGetChannel(id)
        .then(res => {
            document.getElementById("curChat").innerHTML =
                `<div class="curChatN">Current chat: ${res.channel.name}</div>`
        })
        .catch(err => {
            document.getElementById("curChat").innerHTML =
                `<div class="curChatN">No such chat</div>`
        });
}

const createChat = (ch_name) => {
    return new Promise(async (resolve, reject) => {
        const res = await apiCreateChannel(ch_name);
        if (res.success)
            return resolve();
        else
            return reject(res.err_cause);
    });
}

const addToChannel = (ch_id) => {
    const us_id = prompt("Введите id пользователя");
    if (us_id === "" || +us_id === NaN) {
        alert("Неверный id");
        return;
    }
    apiAddToChannel(us_id, ch_id)
        .then(res => {
            console.log("Пользователь успешно добавден к каналу");
        })
        .catch(err => {
            alert(err.cause);
        });
}

const createChannelDiv = (id, name) => {
    document.getElementById("chat_names").innerHTML +=
        `<div class="chaneel_pan" id="chpan_${id}">
            <span class="channel_pan_holder"></span>
            <button class="channel_select" id="chdiv_${id}" onclick="selectChannel(${id}); curChannelName = '${name}';">
                ${name}
            </button>
            <button class="channel_addu" id="chaddu_${id}" onclick="addToChannel(${id});">
                +
            </button>
            <br>
            <span class="channel_pan_holder"></span>
        </div>`;
}

const deleteChannel = (id, name) => {
    return new Promise(async (resolve, reject) => {
        if (id > 0) {
            if (confirm(`Вы действительно хотите удалить (НАВСЕГДА) канал ${name} с ID ${id}`) &&
                confirm(`Последнее предупреждение!`)) {
                apiDeleteChannel(id)
                    .then(res => {
                        if (res.success)
                            return resolve(true);
                        else
                            return reject(res.err_cause);
                    })
                    .catch(err => reject(err));
            }
            return resolve(false);
        }
        else {
            return reject("Cannot delete channel with not valid ID");
        }
    });
}