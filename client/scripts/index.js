'use strict'

init()
    .then((res) => {
        initSocket(() => {
            console.log(`User with ID=${res.user.id} and name=${res.user.nickname}`);
            for (let i in res.channels) {
                console.log(`Channel with ID=${res.channels[i].channel.id} and name=${res.channels[i].channel.name}`)
            }
            selectChannel(1); //TEMP
        });
    })
    .catch((err) => {
        console.error(err);
    });


let lastMsg = "";

const sendMessage = () => {
    const msgTextbox = document.getElementById("input_msg");
    if (msgTextbox.value == "")
        return;
    socketSendMessage(msgTextbox.value);
    lastMsg = msgTextbox.value;
    msgTextbox.value = "";
}

document.getElementById("send_btn").addEventListener("click", (sender) => sendMessage());
document.getElementById("input_msg").addEventListener("keyup", (sender) => {
    if (sender.key == "Enter")
        sendMessage();
    else if (sender.key == "ArrowUp") {
        const msgTextbox = document.getElementById("input_msg");
        if (msgTextbox.value === "")
            msgTextbox.value = lastMsg;
    }
});
