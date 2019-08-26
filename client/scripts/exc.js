'use strict'

let result = "";

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

const send = (adres,data) => {
  var req = new XMLHttpRequest;
  req.onreadystatechange = function () {
    if (req.readyState == 4 && req.status == 200){
      result = req.responseText;
    }
  };
  req.open("POST",adres);
  req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  req.send(data);
};

const get = () => {
  return result;
}
