#!/usr/bin/nodejs
'use strict'

const DEFAULT_PORT = 3000; //Warning: some ports require the admin privileges to launch the server (80 for example)
const SAVING_INTERVAL = 60; //In seconds (Set a negative number to disable autosaving)

const fs = require("fs");
const process = require("process");
const express = require("express");
const bodyParser = require("body-parser");

const dbModulle = require("./modules/database");
const chatModule = require("./modules/chat");

const app = express();
const urlencodedParser = bodyParser.urlencoded({extended: false});

//API methods
app.post("/api/register", urlencodedParser, (request, response) => {
	let login, password;
	login = request.body.login;
	if (login === undefined) {
		response.status(200).send(JSON.stringify({
			err_code: 1,
			err_cause: `Argument not found (login)`
		}));
	}
	password = request.body.password;
	if (login === undefined) {
		response.status(200).send(JSON.stringify({
			err_code: 1,
			err_cause: `Argument not found (password)`
		}));
	}
});

app.post("/api/auth", urlencodedParser, (request, response) => {
	let login, password;
	login = request.body.login;
	if (login === undefined) {
		response.status(200).send(JSON.stringify({
			err_code: 1,
			err_cause: `Argument not found (login)`
		}));
	}
	password = request.body.password;
	if (login === undefined) {
		response.status(200).send(JSON.stringify({
			err_code: 1,
			err_cause: `Argument not found (password)`
		}));
	}
});

app.post("/api/get_user", urlencodedParser, (request, response) => {
	let id;
	id = request.body.id;
	if (login === undefined) {
		response.status(200).send(JSON.stringify({
			err_code: 1,
			err_cause: `Argument not found (id)`
		}));
	}
});
/*
app.post("/api/channels_list", urlencodedParser, (request, response) => {
	response.status(200).send("test_CHANNELS_LIST_method");
});
*/
app.post("/api/add_to_channel", urlencodedParser, (request, response) => {
	let token, user_id, channel_id;
	token = request.body.token;
	if (login === undefined) {
		response.status(200).send(JSON.stringify({
			err_code: 1,
			err_cause: `Argument not found (token)`
		}));
	}
	user_id = request.body.user_id;
	if (login === undefined) {
		response.status(200).send(JSON.stringify({
			err_code: 1,
			err_cause: `Argument not found (user_id)`
		}));
	}
	channel_id = request.body.channel_id;
	if (login === undefined) {
		response.status(200).send(JSON.stringify({
			err_code: 1,
			err_cause: `Argument not found (channel_id)`
		}));
	}
});

app.post("/api/remove_from_channel", urlencodedParser, (request, response) => {
	let token, user_id, channel_id;
	token = request.body.token;
	if (login === undefined) {
		response.status(200).send(JSON.stringify({
			err_code: 1,
			err_cause: `Argument not found (token)`
		}));
	}
	user_id = request.body.user_id;
	if (login === undefined) {
		response.status(200).send(JSON.stringify({
			err_code: 1,
			err_cause: `Argument not found (user_id)`
		}));
	}
	channel_id = request.body.channel_id;
	if (login === undefined) {
		response.status(200).send(JSON.stringify({
			err_code: 1,
			err_cause: `Argument not found (channel_id)`
		}));
	}
});

app.post("/api/change_avatar", urlencodedParser, (request, response) => {
	let token, user_id, avatar;
	token = request.body.token;
	if (login === undefined) {
		response.status(200).send(JSON.stringify({
			err_code: 1,
			err_cause: `Argument not found (token)`
		}));
	}
	user_id = request.body.user_id;
	if (login === undefined) {
		response.status(200).send(JSON.stringify({
			err_code: 1,
			err_cause: `Argument not found (user_id)`
		}));
	}
	avatar = request.body.avatar;
	if (login === undefined) {
		response.status(200).send(JSON.stringify({
			err_code: 1,
			err_cause: `Argument not found (avatar)`
		}));
	}
});

app.post("/api/change_meta", urlencodedParser, (request, response) => {
	let token, user_id, meta;
	token = request.body.token;
	if (login === undefined) {
		response.status(200).send(JSON.stringify({
			err_code: 1,
			err_cause: `Argument not found (token)`
		}));
	}
	user_id = request.body.user_id;
	if (login === undefined) {
		response.status(200).send(JSON.stringify({
			err_code: 1,
			err_cause: `Argument not found (user_id)`
		}));
	}
	meta = request.body.meta;
	if (login === undefined) {
		response.status(200).send(JSON.stringify({
			err_code: 1,
			err_cause: `Argument not found (meta)`
		}));
	}
});

app.post("/api/get_channel", urlencodedParser, (request, response) => {
	let id;
	id = request.body.id;
	if (login === undefined) {
		response.status(200).send(JSON.stringify({
			err_code: 1,
			err_cause: `Argument not found (id)`
		}));
	}
	chatModule.addListener(id);
});

app.post("/api/create_channel", urlencodedParser, (request, response) => {
	let token, channel_name;
	token = request.body.token;
	if (login === undefined) {
		response.status(200).send(JSON.stringify({
			err_code: 1,
			err_cause: `Argument not found (token)`
		}));
	}
	channel_name = request.body.channel_name;
	if (login === undefined) {
		response.status(200).send(JSON.stringify({
			err_code: 1,
			err_cause: `Argument not found (channel_name)`
		}));
	}
});

app.post("/api/delete_channel", urlencodedParser, (request, response) => {
	let token, channel_id;
	token = request.body.token;
	if (login === undefined) {
		response.status(200).send(JSON.stringify({
			err_code: 1,
			err_cause: `Argument not found (token)`
		}));
	}
	channel_id = request.body.channel_id;
	if (login === undefined) {
		response.status(200).send(JSON.stringify({
			err_code: 1,
			err_cause: `Argument not found (channel_id)`
		}));
	}
});

app.post("/api/get_messages", urlencodedParser, (request, response) => {
	let token, channel_id, offset, count;
	token = request.body.token;
	if (login === undefined) {
		response.status(200).send(JSON.stringify({
			err_code: 1,
			err_cause: `Argument not found (token)`
		}));
	}
	channel_id = request.body.channel_id;
	if (login === undefined) {
		response.status(200).send(JSON.stringify({
			err_code: 1,
			err_cause: `Argument not found (channel_id)`
		}));
	}
	offset = request.body.offset;
	if (login === undefined) {
		response.status(200).send(JSON.stringify({
			err_code: 1,
			err_cause: `Argument not found (offset)`
		}));
	}
	count = request.body.count;
	if (login === undefined) {
		response.status(200).send(JSON.stringify({
			err_code: 1,
			err_cause: `Argument not found (count)`
		}));
	}
});

app.post("/api/send_message", urlencodedParser, (request, response) => {
	let token, channel_id, message;
	token = request.body.token;
	if (login === undefined) {
		response.status(200).send(JSON.stringify({
			err_code: 1,
			err_cause: `Argument not found (token)`
		}));
	}
	channel_id = request.body.channel_id;
	if (login === undefined) {
		response.status(200).send(JSON.stringify({
			err_code: 1,
			err_cause: `Argument not found (channel_id)`
		}));
	}
	message = request.body.message;
	if (login === undefined) {
		response.status(200).send(JSON.stringify({
			err_code: 1,
			err_cause: `Argument not found (message)`
		}));
	}
});

app.post("/api/listen", urlencodedParser, (request, response) => {
    let token, channel_id, last_msg;
    token = request.body.token;
    if (token === undefined) {
        response.status(200).send(JSON.stringify({
            err_code: 1, //Wrong number of arguments
            err_cause: `Argument not found (token)`
        }));
    }
    channel_id = request.body.channel_id;
    if (channel_id === undefined) {
        response.status(200).send(JSON.stringify({
            err_code: 1, //Wrong number of arguments
            err_cause: `Argument not found (channel_id)`
        }));
    }
    last_msg = request.body.last_msg;
    if (last_msg === undefined) {
        response.status(200).send(JSON.stringify({
            err_code: 1, //Wrong number of arguments
            err_cause: `Argument not found (last_msg)`
        }));
    }
    chatModule.addListener(channel_id, response, last_msg);
    //Here should be no response for the request
});

app.post("/api/public_cipher", urlencodedParser, (request, response) => {
	let count, ident;
	count = request.body.count;
	if (login === undefined) {
		response.status(200).send(JSON.stringify({
			err_code: 1,
			err_cause: `Argument not found (count)`
		}));
	}
	ident = request.body.ident;
	if (login === undefined) {
		response.status(200).send(JSON.stringify({
			err_code: 1,
			err_cause: `Argument not found (ident)`
		}));
	}
});

app.get("/", (request, response) => {
    response.redirect("/index.html"); //Redirect to index page if request is empty
});
app.use(express.static("./client"));
app.get("*", (request, response) => {
    response.send(fs.readFileSync("./client/404.html").toString("utf-8")); //If page is not found
});


dbModulle.load(() => {
    console.log("Data loaded");
    const port = process.argv.length > 2 ? process.argv[2] : DEFAULT_PORT;
    app.listen(port);
    console.log(`Server started on ${port} port`);
});


let saverId = undefined; //Id of the saving timer
if (SAVING_INTERVAL >= 0) {
    saverId = setInterval(() => {
        console.log("Saving data...");
        dbModulle.save();
        console.log("Data saved");
    }, SAVING_INTERVAL * 1000);
}

process.once("SIGINT", (c) => { //Saving before exit
    app.disable();
    if (saverId !== undefined)
        clearInterval(saverId);
    console.log("Saving data before app closing...");
    dbModulle.save();
    console.log("Data saved");
    process.exit(-1);
});