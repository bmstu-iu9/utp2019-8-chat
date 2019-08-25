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

const init = async () => {
    const token = getCookie("accessToken");
    const authRes = await checkAuth(token);
    if (!authRes.success) {
        console.error(`Authorization failed (${authRes.err_cause})`);
        console.log("Redirect");
        window.location.replace('/auth.html');
        return false;
    }
    const userInfo = await getUser(authRes.userID);
    if (!userInfo.success) {
        console.error(`Error (${userInfo.err_cause})`);
        return false;
    }
    const channelsPromises = [];
    for (let i in userInfo.user.channels) {
        if (userInfo.user.channels[i]) //I have no words...
            channelsPromises.push(getChannel(userInfo.user.channels[i]));
    }
    const channels = await Promise.all(channelsPromises);
    return { success: true, user: userInfo.user, channels: channels };
}