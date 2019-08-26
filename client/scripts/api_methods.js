'use strict'

// api/get_user с визуальным интерфейсом

let timer1;

const show_user_data = () => {
    if (id > 0) {
        let sendStr = "id=" + userId;
        send(adress + "api/get_user", sendStr);
        timer1 = setInterval(function () {
            if (time < 1500)
                time *= 2;
            else clearInterval(timer1);
            let r = get();
            if (r != "") {
                let responseObj = JSON.parse(r);
                processShow_user_data(responseObj);
                clearInterval(timer1);
            }
        }, time);
    }
};

// api/get_user

const apiGetUserData = () => {
    let sendStr = "id=" + userId;
    send(adress + "api/get_user", sendStr);
    let ltime = time;
    let timer = setInterval(function () {
        if (ltime < 1500)
            ltime *= 2;
        else clearInterval(timer);
        let r = get();
        if (r != "") {
            let responseObj = JSON.parse(r);
            processApiGetUserData(responseObj);
            clearInterval(timer);
        }
    }, ltime);
}

// api/add_to_channel

const apiAddToChannel = (channel_id) => {
    let sendStr = "token=" + token + "&user_id=" + userId + "&channel_id=" + channel_id;
    send(adress + "api/add_to_channel", sendStr);
    let ltime = time;
    let timer = setInterval(function () {
        if (ltime < 1500)
            ltime *= 2;
        else clearInterval(timer);
        let r = get();
        if (r != "") {
            let responseObj = JSON.parse(r);
            processApiAddToChannel(responseObj);
            clearInterval(timer);
        }
    }, ltime);
}

// api/remove_from_channel

const apiRemoveFromChannel = (channel_id) => {
    let sendStr = "token=" + token + "&user_id=" + userId + "&channel_id=" + channel_id;
    send(adress + "api/remove_from_channel", sendStr);
    let ltime = time;
    let timer = setInterval(function () {
        if (ltime < 1500)
            ltime *= 2;
        else clearInterval(timer);
        let r = get();
        if (r != "") {
            let responseObj = JSON.parse(r);
            processApiRemoveFromChannel(responseObj);
            clearInterval(timer);
        }
    }, ltime);
}

// api/change_avatar

const apiChangeAvatar = (avatar) => {
    let sendStr = "token=" + token + "&user_id=" + userId + "&avatar=" + avatar;
    send(adress + "api/change_avatar", sendStr);
    let ltime = time;
    let timer = setInterval(function () {
        if (ltime < 1500)
            ltime *= 2;
        else clearInterval(timer);
        let r = get();
        if (r != "") {
            let responseObj = JSON.parse(r);
            processApiChangeAvatar(responseObj);
            clearInterval(timer);
        }
    }, ltime);
}

// api/get_channel

const apiGetChannel = (channel_id) => {
    let sendStr = "id=" + channel_id;
    send(adress + "api/get_channel", sendStr);
    let ltime = time;
    let timer = setInterval(function () {
        if (ltime < 1500)
            ltime *= 2;
        else clearInterval(timer);
        let r = get();
        if (r != "") {
            let responseObj = JSON.parse(r);
            processApiGetChannel(responseObj);
            clearInterval(timer);
        }
    }, ltime);
}

// api/create_channel

const apiCreateChannel = (channel_name) => {
    let sendStr = "token=" + token + "&channel_name=" + channel_name;
    send(adress + "api/create_channel", sendStr);
    let ltime = time;
    let timer = setInterval(function () {
        if (ltime < 1500)
            ltime *= 2;
        else clearInterval(timer);
        let r = get();
        if (r != "") {
            let responseObj = JSON.parse(r);
            processApiCreateChannel(responseObj);
            clearInterval(timer);
        }
    }, ltime);
}

// api/delete_channel

const apiDeleteChannel = (ch_id) => {
    let sendStr = "token=" + token + "&channel_id=" + ch_id;
    send(adress + "api/delete_channel", sendStr);
    let ltime = time;
    let timer = setInterval(function () {
        if (ltime < 1500)
            ltime *= 2;
        else clearInterval(timer);
        let r = get();
        if (r != "") {
            let responseObj = JSON.parse(r);
            processApiDeleteChannel(responseObj);
            clearInterval(timer);
        }
    }, ltime);
}

// api/get_messages

const apiGetMessages = (ch_id, offset, count) => {
    let sendStr = "token=" + token + "&channel_id=" + ch_id + "&offset=" + offset + "&count=" + count;
    send(adress + "api/get_messages", sendStr);
    let ltime = time;
    let timer = setInterval(function () {
        if (ltime < 1500)
            ltime *= 2;
        else clearInterval(timer);
        let r = get();
        if (r != "") {
            let responseObj = JSON.parse(r);
            processApiGetMessage(responseObj);
            clearInterval(timer);
        }
    }, ltime);
}

// api/send_message

const apiSendMessage = (ch_id, msg) => {
    let sendStr = "token=" + token + "&channel_id=" + ch_id + "&message=" + msg;
    send(adress + "api/send_message", sendStr);
    let ltime = time;
    let timer = setInterval(function () {
        if (ltime < 1500)
            ltime *= 2;
        else clearInterval(timer);
        let r = get();
        if (r != "") {
            let responseObj = JSON.parse(r);
            processApiSendMessage(responseObj);
            clearInterval(timer);
        }
    }, ltime);
}

///////////////////////////////////////////////////////////////////////////////////////////


// api/exit_session

const apiExitSession = () => {
    let paramsStr = "token=" + token;
    send(adress + "api/exit_session", paramsStr);
    let ltime = time;
    let timer = setInterval(function () {
        if (ltime < 1500)
            ltime *= 2;
        else clearInterval(timer);
        let r = get();
        if (r != "") {
            let responseObj = JSON.parse(r);
            processApiExitSession(responseObj);
            clearInterval(timer);
        }
    }, ltime);
}

// api/exit_all_session

const apiExitAllSessions = () => {
    let paramsStr = "token=" + token;
    send(adress + "api/exit_all_session", paramsStr);
    let ltime = time;
    let timer = setInterval(function () {
        if (ltime < 1500)
            ltime *= 2;
        else clearInterval(timer);
        let r = get();
        if (r != "") {
            let responseObj = JSON.parse(r);
            processApiExitAllSessions(responseObj);
            clearInterval(timer);
        }
    }, ltime);
}