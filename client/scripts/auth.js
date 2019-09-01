'use strict'

apiCheckToken()
    .then(res => {
        console.log("Redirect");
        window.location.replace('/index.html'); //???
    })
    .catch(err => { });

const auth = (login, password) => {
    return new Promise((resolve, reject) => {
        request("api/auth", { login: login, password: password })
            .then(res => {
                const response = JSON.parse(res.response);
                if (response.success)
                    return resolve(response.token);
                else
                    return reject(response.err_cause);
            })
            .catch(err => reject(err));
    });
}

const process = () => {
    const login = document.getElementById("login").value;
    const password = document.getElementById("password").value;
    if (checkLogin(login) && checkPassword(password)) {
        auth(login, password)
            .then(res => {
                setCookie("accessToken", res);
                window.location.replace('/index.html');
            })
            .catch(err => { alert(err); });
    }
    else {
        alert("Неверный логин или пароль");
    }
}

document.getElementById("authBtn").addEventListener('click', process);
document.getElementById("login").addEventListener('keyup', e => {
    if (e.key === 'Enter') {
        const pass_box = document.getElementById("password");
        if (pass_box.value !== "")
            pass_box.focus();
        else
            process();
    }
});
document.getElementById("password").addEventListener('keyup', e => {
    if (e.key === 'Enter')
        process();
});

document.getElementById("login").focus();