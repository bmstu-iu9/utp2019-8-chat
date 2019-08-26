'use strict'

let span;

const createSpan = () => {
  span = document.createElement("span");
  if (span) {
    span.setAttribute("id","span");
    span.classList.add("msg_hide");
    span.classList.add("msg_ok");
    let div = document.body.children[0];
    if (div) {
      if (!div.insertBefore(span, div.firstChild)) {
        console.log("Span wasn't appended");
      }
    } else console.log("Div does not exist");
  }
}

const showMessage = (msg,status) => {
    if (span) {
      span.classList.remove("msg_hide");
      span.classList.add("msg_show");
      span.innerHTML = msg;
      if (status == "error"){
        span.classList.remove("msg_ok");
        span.classList.add("msg_error");
      }
      else{
        span.classList.remove("msg_error");
        span.classList.add("msg_ok");
      }
    } else console.log("A message field wasn't found");
}

const hideMessage = () => {
  if (span) {
    span.classList.toggle("msg_hide");
    span.classList.toggle("msg_show");
  } else console.log("A message field wasn't found");
}

createSpan();
if (span)
  span.addEventListener("click", hideMessage);
else console.log("A message field wasn't created");
