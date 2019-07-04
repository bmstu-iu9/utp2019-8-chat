const msgTextbox = document.getElementById("input_msg");

document.getElementById("send_btn").addEventListener("click", (sender) => {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/send_message', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(`channel_id=1&message=${msgTextbox.value}`);
    xhr.onreadystatechange = () => {
        if (xhr.readyState != 4) 
            return;
        if (xhr.status == 200) { //Ok
            alert(xhr.responseText)
        }
        else if (xhr.status == 401) { //Unauthorized
            alert("Unauthorized")
        }
        else if (xhr.status == 403) { //Forbiden
            alert("Forbiden")
        }
        else {
            alert("Something weird happened")
        }
    }
});