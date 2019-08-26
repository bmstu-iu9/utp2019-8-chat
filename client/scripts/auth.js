'use strict'

var inputId;
var container;
var buttonId;
var login;
var password;
var buttonAuth;

const auth = () => {
    login = document.getElementById("login");
    password = document.getElementById("password");
    if(login && password && login.value != "" && password.value != ""){
    	let paramsStr = "login="+login.value+"&"+"password="+password.value;
      send(adress+"api/auth",paramsStr);
      let ltime = 10;
      let timer = setInterval(function(){
        if (ltime < 1500)
          ltime*=2;
        else clearInterval(timer);
        let r = get();
        if (r!="") {
          let responseObj = JSON.parse(r);
          process(responseObj);
          clearInterval(timer);
        }
      },ltime);
    }
}

const process = (data) =>{
  if(!data.success)
    showMessage(data.err_cause, "error");
  else
  {
    token = encodeMessage(data.token);
    //console.log(token);

    // Test - api/get_user
    //console.log("user.js - Test api/get_user (id=" + userId +"):");
    //apiGetUserData();

    // Test api/add_to_channel
    //let ch_id = 10;
    //console.log("user.js - Test api/add_to_channel (token="+token+", id=" + userId +", channel_id="+ch_id+"):");
    //apiAddToChannel(ch_id);

    // Test api/remove_from_channel
    //let ch_id = 10;
    //console.log("user.js - Test api/remove_from_channel (token="+token+", id=" + userId +", channel_id="+ch_id+"):");
    //apiRemoveFromChannel(ch_id);

    // Test api/change_avatar
    //let avatar = "";
    //console.log("user.js - Test api/change_avatar (token="+token+", id=" + userId +", avatar="+avatar+"):");
    //apiChangeAvatar(avatar);

    // Test api/change_meta
    //let meta = "{\"bio\":\"BMSTU student (new)\"}";
    //console.log("user.js - Test api/change_meta (token="+token+", id=" + userId +", meta="+meta+"):");
    //apiChangeMeta(meta);

    // Test api/get_channel
    //let ch_id = 1;
    //console.log("user.js - Test api/get_channel (channel_id="+ch_id+"):");
    //apiGetChannel(ch_id);

    // Test api/create_channel
    //let channel_name = "Tutu";
    //console.log("user.js - Test api/create_channel (token="+token+", channel_name="+channel_name+"):");
    //apiCreateChannel(channel_name);

    // Test api/delete_channel
    //let ch_id = 3;
    //console.log("user.js - Test api/delete_channel (token="+token+", channel_id="+ch_id+"):");
    //apiDeleteChannel(ch_id);

    // Test api/get_messages
    //let ch_id = 1;
    //let offset = 0;
    //let count = 3;
    //console.log("user.js - Test api/get_messages (token="+token+", channel_id="+ch_id+", offset="+offset+", count="+count+"):");
    //apiGetMessages(ch_id, offset, count);

    // Test api/send_message
    //let ch_id = 1;
    //let message = "Test";
    //console.log("user.js - Test api/send_message (token="+token+", channel_id="+ch_id+", message="+message+"):");
    //apiSendMessage(ch_id, message);

    // Test api/get_public_cipher
    console.log("user.js - Test api/get_public_cipher:");
    apiGetPublicCipher();

    // Test api/exit_session and api/exit_all_sessions
    //apiExitSession();
    //apiExitAllSessions();

  //  show_user_data(userId);
  //  createUserElements();
    showMessage("User authenticated successfully" + " " + token, "ok");
  }
}

// api/exit_session

const apiExitSession = () => {
    	let paramsStr = "token="+token;
      send(adress+"api/exit_session",paramsStr);
      let ltime = time;
      let timer = setInterval(function(){
        if (ltime < 1500)
          ltime*=2;
        else clearInterval(timer);
        let r = get();
        if (r!="") {
          let responseObj = JSON.parse(r);
          processApiExitSession(responseObj);
          clearInterval(timer);
        }
      },ltime);
}

const processApiExitSession = (data) =>{
  if(!data.success)
    console.log("Error " + data.err_code + ": " + data.err_cause);
    //showMessage(data.err_cause, "error");
  else{
    console.log("Успешный выход (" + token + ")");
  //  token = "";
  }
}

// api/exit_all_session

const apiExitAllSessions = () => {
    	let paramsStr = "token="+token;
      send(adress+"api/exit_all_session",paramsStr);
      let ltime = time;
      let timer = setInterval(function(){
        if (ltime < 1500)
          ltime*=2;
        else clearInterval(timer);
        let r = get();
        if (r!="") {
          let responseObj = JSON.parse(r);
          processApiExitAllSessions(responseObj);
          clearInterval(timer);
        }
      },ltime);
}

const processApiExitAllSessions = (data) =>{
  if(!data.success)
    console.log("Error " + data.err_code + ": " + data.err_cause);
    //showMessage(data.err_cause, "error");
  else
    console.log("Успешный выход из всех сессий");
}


// Создание визуального интерфейса

const createUserElements = () =>{
  container = document.getElementsByClassName("container")[0];
  if(container){
    deleteAuthElements();
    let aProfileSettings = document.createElement("a");
    aProfileSettings.setAttribute("href","profile.html?token="+token);
    aProfileSettings.innerHTML = "Настройки профиля";
    aProfileSettings.classList.add("link_to_profile");
    container.appendChild(aProfileSettings);
/*
    inputId = document.createElement("input");
    inputId.setAttribute("type","text");
    inputId.setAttribute("id","id");
    container.appendChild(inputId);
    buttonId = document.createElement("button");
    buttonId.setAttribute("id","show_user_data");
    buttonId.innerHTML = "Получить информацию о пользователе";
    container.appendChild(buttonId);
*/
    spanNickname = document.createElement("span");
    spanNickname.setAttribute("id","nickname");
    spanNickname.classList.add("nickname");
    container.appendChild(spanNickname);

    spanChannelsList = document.createElement("span");
    spanChannelsList.setAttribute("id","channels_list");
    spanChannelsList.classList.add("channels_list")
    container.appendChild(spanChannelsList);

  }
}

const deleteAuthElements = () =>{
  if(login && password && buttonAuth){
    container.removeChild(login);
    container.removeChild(password);
    container.removeChild(buttonAuth);
  }
}

buttonAuth = document.getElementById("button");
if(buttonAuth){
  buttonAuth.addEventListener("click",auth);
}
