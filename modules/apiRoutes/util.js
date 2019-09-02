'use strict'

module.exports.ERR_NO_PERMISSIONS = { success: false, err_code: 6, err_cause: "You don't have permissions to do that" };
module.exports.ERR_FILE_NO_UPLOADED = { success: false, err_code: -2, err_cause: "File not loaded" };
module.exports.ERR_CHANNEL_NO_EXIST = { success: false, err_code: 3, err_cause: "Channel does not exist" };

module.exports.getArgs = (request, response, args) => {
    let req = {};
    for (let i in args) {
        req[args[i]] = request.body[args[i]];
        if (req[args[i]] === undefined) {
            response.status(200).send(JSON.stringify({
                success: false,
                err_code: 1,
                err_cause: `Argument not found (${args[i]})`
            }));
            return undefined;
        }
    }
    return req;
}

module.exports.checkPerm = (user, check) => {
    return (user.permissions & (check | 1)) !== 0; // 1 - admin
}

module.exports.checkLogin = (login) => {
    const len = login.length;
    if (len < 1 && len > 20) {
        return false;
    }
    for (let i = 0; i < len; i++) {
        if ((login[i] < 'A' || login[i] > 'Z') &&
            (login[i] < 'a' || login[i] > 'z') &&
            (login[i] < '0' || login[i] > '9') &&
            login[i] != '_' && login[i] != '.' &&
            login[i] != '-' && login[i] != ' ') {
            return false;
        }
    }
    return true;
}

module.exports.checkPassword = (password) => {
    let b1 = false;
    let b2 = false;
    const len = password.length;
    if (len > 5) {
        for (let i = 0; (!b1 || !b2) && i < len; i++) {
            if (!b1 && (password[i] >= 'A' && password[i] <= 'Z' ||
                password[i] >= 'a' && password[i] <= 'z')) {
                b1 = true;
            }
            else if (!b2 && password[i] >= '0' && password[i] <= '9') {
                b2 = true;
            }
        }
    }
    return b1 && b2;
}