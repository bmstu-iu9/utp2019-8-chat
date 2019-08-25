'use strict'

const FIELDS_COUNT = 5;

const inputDiv = document.getElementById("input");
for (let i = 0; i < FIELDS_COUNT; i++) {
    inputDiv.innerHTML +=
        `<div class="param_block" style>
            <input type="text" id="param_name_${i}" class="param_name" style="width: 150px;">
            : <input type="text" id="param_val_${i}" class="param_val" style="width: 500px;">
        </div><br>`
}

document.getElementById("send_btn").addEventListener('click', (sender) => {
    let dest = document.getElementById("dest").value;
    let params = {};
    let name, val;
    for (let i = 0; i < FIELDS_COUNT; i++) {
        name = document.getElementById(`param_name_${i}`).value;
        if (name !== "")
            params[name] = document.getElementById(`param_val_${i}`).value;
    }
    request(dest, params)
        .then((res) => {
            document.getElementById("response_area").innerHTML = res.response;
        })
        .catch((err) => {
            console.log(err);
        });
});