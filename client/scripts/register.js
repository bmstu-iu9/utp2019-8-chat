let span = document.createElement("span");
span.innerHTML = "Вы неправильно что-то сделали";
span.style.display = "none";
document.documentElement.children[1].appendChild(span);

let register = function(){
	let login = document.getElementById("login");
	let password = document.getElementById("password");
	if(span && login && password && test()){
		span.style.display = "none";
		var req = new XMLHttpRequest();
		req.onreadystatechange = function(){
    		if(this.readyState == 4 && this.status == 200) {
     	 		console.log(req.responseText);
    		}
  		};
  	req.open("POST","http://localost:3000/api/register",true);
  	let json = "{\"login\":\"" + login.value  +"\",\"password\":\"" + password.value + "\"}";
  	console.log(json);
  	req.send(json);
	} else {
		if (span)
			span.style.display = "block";
	}
}
