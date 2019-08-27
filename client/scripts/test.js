#!/usr/bin/nodejs

'use strict'

const mysql = require("mysql");

const db = mysql.createConnection({
	host     : 'remotemysql.com',
	user     : '9SpT1uQOyM',
	password : 'utp2019password',
	database : '9SpT1uQOyM'
});

db.connect((err) => {
	if(err){
		console.log("Connection error");
		throw err;
	}
	console.log("Connected");
});

const loadUsersData = () => {
	let sql = "select * from users";
	let query = db.query(sql, (err, results) =>{
		if (err)
			throw err;
		console.log(results);
		return results;
	});
}

const addUser = (login, hash, salt) => {
	let post = {login: login, hash: hash, salt: salt};
	let sql = "insert into users set ?";
	let query = db.query(sql, post, (err, result) =>{
		if (err)
			throw err;
	});
	sql = "select LAST_INSERT_ID()";
	query = db.query(sql, (err, result) => {
		if (err)
			throw err;
		for (let key in result[0])
			return result[0][key];
	});
}