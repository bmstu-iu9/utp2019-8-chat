const msgTextbox = document.getElementById("input_msg");
const chatFlow = document.getElementById("chat_flow");

// TEMPORARY
var _username = "Alice";
document.getElementById("_TEMP_btn").addEventListener("click", (sender) => {
    let t = document.getElementById("_TEMP_login").value;
    _username = t === "" ? "Toster" : t;
});
// END TEMPORARY

const addMessage = (author, text) => { //Add message to chat-flow zone
    chatFlow.innerHTML +=
        `<div class="msg_box">\n` + 
        `    <div class="name">${author}</div>\n` + 
        `    <div class="msg">${text}</div>\n` + 
        `</div>`;
}

const sendMessage = () => {
    if (msgTextbox.value == "")
        return;
    let msg = msgTextbox.value;
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState != 4) 
            return;
        if (xhr.status == 200) { //Ok
            //addMessage("You", msg);
            console.log(xhr.responseText);
            document.getElementById("chat_flow").scrollTop = 9999;
        }
        else if (xhr.status == 401) { //Unauthorized
            alert("Unauthorized");
        }
        else if (xhr.status == 403) { //Forbiden
            alert("Forbiden");
        }
        else {
            alert("Something weird happened");
        }
    }
    xhr.open('POST', '/api/send_message', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(`channel_id=1&author_name=${_username}&message=${msg}`); // INJECTION!!!!!!!!!!!!!!!!
    msgTextbox.value = "";
}

var lastMsg = 0;

document.getElementById("send_btn").addEventListener("click", (sender) => sendMessage());
msgTextbox.addEventListener("keyup", (sender) => {
    if (sender.key == "Enter")
        sendMessage();
});

const subscribe = (url) => {
let xhr = new XMLHttpRequest();
xhr.onreadystatechange = () => {
    if (xhr.readyState != 4) 
        return;
    if (xhr.status == 200) {
        let response = JSON.parse(xhr.responseText);
        lastMsg = response.id;
        addMessage(response.message.author_name, response.message.message);
    } else {
        console.log(xhr);
    }
    subscribe(url);
}
xhr.open("POST", url, true);
xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
xhr.send(`last_msg=${lastMsg}`);
}
subscribe("/api/listen")