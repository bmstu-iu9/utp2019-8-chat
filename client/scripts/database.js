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
	let id = -1;
	let query = db.query(sql, post, (err, result) =>{
		if (err)
			throw err;
	});
	sql = "select LAST_INSERT_ID()";
	query = db.query(sql, (err, result) => {
		if (err)
			throw err;
		for (let key in result[0]){
			id = result[0][key];
			break;
		}
	});
	post = {id: id, nickname: login};
	sql = "insert into users_data set ?";
	query = db.query(sql, post, (err, result) =>{
		if (err)
			throw err;
	});
	return id;
}

const updateLogin = (id, login) => {
	let sql = "update users set login = " + "'" + login + "'" + " where id = " + id;
	let query = db.query(sql, (err, result) =>{
		if (err)
			throw err;
	});
}

const updateHash = (id, hash) => {
	let sql = "update users set hash = " + "'" + hash + "'" + " where id = " + id;
	let query = db.query(sql, (err, result) =>{
		if (err)
			throw err;
	});
}

const updateSalt = (id, salt) => {
	let sql = "update users set salt = " + "'" + salt + "'" + " where id = " + id;
	let query = db.query(sql, (err, result) =>{
		if (err)
			throw err;
	});
}

const updateNickname = (id, nickname) => {
	let sql = "update users_data set nickname = " + "'" + nickname + "'" + " where id = " + id;
	let query = db.query(sql, (err, result) =>{
		if (err)
			throw err;
	});
}

const updatePremission = (id, permission) => {
	let sql = "update users_data set permission = " +  permission + " where id = " + id;
	let query = db.query(sql, (err, result) =>{
		if (err)
			throw err;
	});
}

const updateAvatar = (id, avatar) => {
	let sql = "update users_data set avatar = " + "'" + avatar + "'" + " where id = " + id;
	let query = db.query(sql, (err, result) =>{
		if (err)
			throw err;
	});
}