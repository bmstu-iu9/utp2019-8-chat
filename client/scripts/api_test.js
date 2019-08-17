'use strict'

const sendRequest = (dest, params, callback) => {
	const encodeMessage = (str) => { //Replace special charasters to codes
		return str.toString().
			replace(/\$/g, "%24").
			replace(/\&/g, "%26").
			replace(/\+/g, "%2b").
			replace(/\,/g, "%2c").
			replace(/\//g, "%2f").
			replace(/\:/g, "%3a").
			replace(/\;/g, "%3b").
			replace(/\=/g, "%3d").
			replace(/\?/g, "%3f").
			replace(/\@/g, "%40");
	}
	let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState != 4) 
            return;
		callback(xhr.responseText, xhr.status);
    }
    xhr.open('POST', dest, true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	let paramStr = [];
	for (let key in params) {
		paramStr.push(`${key}=${encodeMessage(params[key])}`);
	}
    xhr.send(paramStr.join('&'));
    return dest + "\n" + paramStr;
}

document.getElementById("send_btn").addEventListener('click', (sender) => {
    let dest = document.getElementById("dest").value;
    let params = {};
    let name, val;
    name = document.getElementById("param_name_1").value;
    if (name !== "")
        params[name] = document.getElementById("param_val_1").value;
    name = document.getElementById("param_name_2").value;
    if (name !== "")
        params[name] = document.getElementById("param_val_2").value;
    name = document.getElementById("param_name_3").value;
    if (name !== "")
        params[name] = document.getElementById("param_val_3").value;
    name = document.getElementById("param_name_4").value;
    if (name !== "")
        params[name] = document.getElementById("param_val_4").value;
    let req = sendRequest(dest, params, (response, status) => {
        document.getElementById("response_area").innerHTML = response;
    });
    document.getElementById("request_area").innerHTML = req;
});