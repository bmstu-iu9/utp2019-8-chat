#!/usr/bin/nodejs
'use strict'

//const express = require("express");
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

document.getElementById("Save").addEventListener('click',function ()
    {
     alert("hello");
     //validation code to see State field is mandatory.  
    }  ); 

const registration = () => {
	alert("lol");
}