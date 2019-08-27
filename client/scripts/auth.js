'use strict'

const auth = (login, password) => {
    return new Promise((resolve, reject) => {
        request("api/auth", { login: login, password: password })
            .then((res) => {
                const response = JSON.parse(res.response);
                if (response.success)
                    return resolve(response.token);
                else
                    return reject(response.err_cause);
            })
            .catch((err) => {
                return reject(err);
            });
    });
}

const process = () => {
    const login = document.getElementById("login").value;
    const password = document.getElementById("password").value;
    if (checkLogin(login) && checkPassword(password)) {
        auth(login, password)
            .then((res) => {
                setCookie("accessToken", res);
                request("/api/feature", { token: getCookie("accessToken"), data: "Join1" })     //TODO: TEMP FEATURE
                    .then(() => { window.location.replace('/index.html'); })                    //TODO: TEMP FEATURE
                    .catch(() => { window.location.replace('/index.html'); });                  //TODO: TEMP FEATURE
            })
            .catch((err) => {
                alert(err);
            });
    }
    else {
        alert("Неверный логин или пароль");
    }
}

document.getElementById("authBtn").addEventListener('click', process);
document.getElementById("login").addEventListener('keyup', (e) => {
    if (e.key === 'Enter')
        process();
});
document.getElementById("password").addEventListener('keyup', (e) => {
    if (e.key === 'Enter')
        process();
});

document.getElementById("login").focus();