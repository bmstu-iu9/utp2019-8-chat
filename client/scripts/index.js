const msgTextbox = document.getElementById("input_msg");
const chatFlow = document.getElementById("chat_flow");

const addMessage = (author, text) => { //Add message to chat-flow zone
    chatFlow.innerHTML +=
        `<div class="msg_box">
            <div class="name">${author}</div>
            <div class="msg">${text}</div>
        </div>`;
}

const sendMessage = () => {
    if (msgTextbox.value == "")
        return;
    let msg = msgTextbox.value;
    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/send_message', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(`channel_id=1&message=${msg}`);
    msgTextbox.value = "";
    xhr.onreadystatechange = () => {
        if (xhr.readyState != 4) 
            return;
        if (xhr.status == 200) { //Ok
            addMessage("You", msg);
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
}

document.getElementById("send_btn").addEventListener("click", (sender) => sendMessage());
msgTextbox.addEventListener("keyup", (sender) => {
    if (sender.key == "Enter")
        sendMessage();
});