'use strict'

const msgTextbox = document.getElementById("text");
const chatFlow = document.getElementById("chat_flow");

const getCookie = (name) => {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

const setCookie = (name, value, options = {}) => {
    options = {
        path: '/',
        ...options
    };
    if (options.expires && options.expires.toUTCString) {
        options.expires = options.expires.toUTCString();
    }
    let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
    for (let optionKey in options) {
        updatedCookie += "; " + optionKey;
        let optionValue = options[optionKey];
        if (optionValue !== true) {
            updatedCookie += "=" + optionValue;
        }
    }
    document.cookie = updatedCookie;
}

const deleteCookie = (name) => {
    setCookie(name, "", { 'max-age': -1 });
}

if (getCookie("accessToken") === undefined) {
    setCookie("accessToken", "123");
}

const sendRequest = (dest, params, callback) => {
    const encodeMessage = (str) => { //Replace special charasters to codes
        return str.toString().
            replace(/\$/g, "%24").
            replace(/\&/g, "%26").
            replace(/\+/g, "%2b").
            replace(/\,/g, "%2c").
            replace(/\//g, "%2f").
            replace(/\:/g, "%3a").
            replace(/\;/g, "%3b").
            replace(/\=/g, "%3d").
            replace(/\?/g, "%3f").
            replace(/\@/g, "%40");
    }
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState != 4)
            return;
        callback(xhr.responseText, xhr.status);
    }
    xhr.open('POST', dest, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    let paramStr = [];
    for (let key in params) {
        paramStr.push(`${key}=${encodeMessage(params[key])}`);
    }
    xhr.send(paramStr.join('&'));
    return dest + "\n" + paramStr;
}

const addMessage = (author, text, time) => { //Add message to chat-flow zone
    let d = new Date(time);
    chatFlow.innerHTML +=
        `<div class="msg_box">
            <div class="msg_info_zone">
                <div class="msg_icon"></div>            
            </div>
            <div class="msg_message_zone">
                <div class="name">${author}</div>
                <div class="msg_time">${d.getHours()}:${(d.getMinutes()<10?'0':'') + d.getMinutes()}</div>
                <div class="msg">${text}</div>
            </div>
        </div>`
    chatFlow.scrollTop = 9999;
}

sendRequest("/api/get_messages", {
    token: getCookie("accessToken"),
    channel_id: 1,
    offset: 0,
    count: 50
}, (response, status) => {
    response = JSON.parse(response);
    if (response.success) {
        for (let i = 0; i < response.count; i++) {
            let cur = response.messages[i];
            addMessage(cur.author_name, cur.message, cur.time);
        }
    }
    else {
        console.log(response);
    }
});


let socket = new WebSocket(`${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/chatSocket`);

socket.onopen = (e) => {
    console.log("Web socket connected");
    socket.send(JSON.stringify({
        type: "set_channel",
        channel_id: 1,
        token: getCookie("accessToken")
    }));
};

socket.onmessage = (event) => {
    let resp = JSON.parse(event.data);
    if (resp.success && resp.type === "new_message") {
        addMessage(resp.data.author_name, resp.data.message, resp.data.time);
    }
    else {
        console.log(resp);
    }
};

socket.onclose = (event) => {
    if (event.wasClean) {
        console.log(`Соединение закрыто чисто, код=${event.code} причина=${event.reason}`);
    } else {
        console.log('Соединение прервано');
    }
};

socket.onerror = (error) => {
    alert(`[error] ${error.message}`);
};

var observe;
		if (window.attachEvent) {
			observe = function (element, event, handler) {
				element.attachEvent('on'+event, handler);
			};
		}
		else {
			observe = function (element, event, handler) {
				element.addEventListener(event, handler, false);
			};
		}
		function init () {
			var text = document.getElementById('text');
			function resize () {
				text.style.height = 'auto';
				text.style.height = text.scrollHeight+'px';
			}
			function delayedResize () {
				window.setTimeout(resize, 0);
			}
			observe(text, 'change',  resize);
			observe(text, 'cut',     delayedResize);
			observe(text, 'paste',   delayedResize);
			observe(text, 'drop',    delayedResize);
			observe(text, 'keydown', delayedResize);
			observe(text, 'keyup', delayedResize);

			text.focus();
			text.select();
			resize();
		}

const sendMessage = () => {
    if (msgTextbox.value == "")
        return;
    let msg = msgTextbox.value;
    socket.send(JSON.stringify({
        type: "send_message",
        token: getCookie("accessToken"),
        channel_id: 1,
        message: msg
    }));
    msgTextbox.value = "";
	
}

document.getElementById("send_btn").addEventListener("click", (sender) => sendMessage());
msgTextbox.addEventListener("keyup", (sender) => {
    if (!sender.shiftKey && sender.keyCode == 13)
        sendMessage();
});

document.getElementById("setToken_btn").addEventListener("click", (sender) => {
    let token = document.getElementById("tokenArea").value;
    console.log(token);
    setCookie("accessToken", token);
});