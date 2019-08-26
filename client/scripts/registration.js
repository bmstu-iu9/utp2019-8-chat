'use strict'

const checkLogin = (login) => {
    return login !== ""; //TODO
}
const checkPassword = (password) => {
    return password !== ""; //TODO
}

const registration = async (login, password) => {
    return new Promise((resolve, reject) => {
        request("api/register", { login: login, password: password })
            .then((res) => {
                const response = JSON.parse(res.response);
                if (response.success) {
                    return resolve();
                }
                else {
                    return reject(response.err_cause);
                }
            })
            .catch((err) => {
                return reject(err);
            });
    });
}

document.getElementById("btnSend").addEventListener("click", () => {
    const login = document.getElementById("login").value;
    const password = document.getElementById("password").value;
    if (checkLogin(login) && checkPassword(password)) {
        registration(login, password)
            .then((res) => {
                window.location.replace('/auth.html');
            })
            .catch((err) => {
                alert(err);
            });
    }
    else {
        alert("Логин или пароль не соответствуют внутренней политике");
    }
})
