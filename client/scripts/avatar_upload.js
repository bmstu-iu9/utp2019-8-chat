'use strict'

const sendFile = (path, formData) => {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4)
                return resolve({ response: xhr.responseText, status: xhr.status });
        }
        xhr.open('POST', path, true);
        xhr.send(formData);
    });
}

document.getElementById("file_input").onchange = (evt) => {
    const tgt = evt.target || window.event.srcElement, files = tgt.files;
    if (FileReader && files && files.length) {
        var fr = new FileReader();
        fr.onload = () => {
            document.getElementById("avatar_preview").src = fr.result;
        }
        fr.readAsDataURL(files[0]);
    }
}

document.getElementById("send_btn").addEventListener('click', (sender) => {
    const path = "api/change_avatar";
    const file = document.getElementById("file_input").files[0];
    apiCheckToken()
        .then(uesrID => {
            const formData = new FormData();
            formData.append("filedata", file, file.name);
            formData.append("token", getCookie("accessToken"));
            formData.append("user_id", uesrID);
            sendFile(path, formData)
                .then(res => {
                    res = JSON.parse(res.response);
                    if (res.success) {
                        console.log("Succes");
                        window.location.replace('/index.html');
                    }
                    else {
                        alert(res.err_cause);
                    }
                })
                .catch(err => { alert(err); });
        })
        .catch(err => {
            console.error(`Authorization failed (${err})`);
            console.log("Redirect");
            window.location.replace('/auth.html');
        });
});