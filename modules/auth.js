'use-strict'

const crypto = require("crypto");

data = [];

module.exports.register = (login, password) => {
    if (typeof(login) !== "string" || typeof(password) !== "string") {
        return {
            success: false, 
            err_code: 2, 
            err_cause: "wrong type of argument"
        };
    }
    for (let i = 0; i < data.length; i++) {
        if (data[i].login === login) {
            return {
                success: false, 
                err_code: 3, 
                err_cause: "user with this login already exists"
            };
        }
    }
    data.push({
        login: login, 
        id: data.length, 
        hash: crypto.createHash("sha512").update(password).digest("base64")
    });
    return { success: true };
}

module.exports.auth = (login, password) => {
	if (typeof(login) !== "string" || typeof(password) !== "string") {
        return {
            success: false, 
            err_code: 2, 
            err_cause: "wrong type of argument"
        };
    }
    let current = undefined;
    for (let i = 0; i < data.length; i++) {
        if (data[i].login === login) {
            current = data[i];
            break;
        }
        if (i === data.length - 1) 
            return {
                success: false, 
                err_code: 7,
                err_cause: "user doesn't exist"
            };
    }
    if (current.hash !== crypto.createHash("sha512").update(password).digest("base64")) {
        return {
            success: false, 
            err_code: 4, 
            err_cause: "wrong password"
        };
    }
    return {
        success: true, 
        token: crypto.randomBytes(64).toString("base64")
    };
}

module.exports.load = () => {

}

module.exports.save = () => {

}