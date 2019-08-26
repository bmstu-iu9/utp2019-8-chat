'use strict'

let timer;

const registration = () => {
  let login = document.getElementById("login");
  let password = document.getElementById("password");
  if(login && password && login.value != "" && password.value != ""){
    let sendData = "login="+login.value+"&"+"password="+password.value;
    send(adress+"api/register",sendData);
    timer = setInterval(function(){
      if (time < 1500)
        time*=2;
      else clearInterval(timer);
      let r = get();
      if (r!="") {
        let responseObj = JSON.parse(r);
        process(responseObj,"Пользователь успешно зарегистрирован");
        clearInterval(timer);
      }
    },time);
  }
  else showMessage("Введите логин и пароль для нового пользователя","error");
};

const process = (data, msg) =>{
  if(!data.success)
    showMessage(data.err_cause, "error");
  else
    showMessage(msg, "ok");
}

document.getElementById("btnSend").addEventListener("click",registration);
