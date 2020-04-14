const express = require("express");
const session = require('express-session');
const bodyParser = require("body-parser");
const path = require("path");
const routes = require("./routes/routes");
const db = require("./database/db");
const app = express();

app.set("views", "./views");
app.set("view engine", "ejs");

app.use(session({
	secret: "rootroot",
	resave: true,
	saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, "public")));
app.use(routes);

db.query("CREATE TABLE IF NOT EXISTS db_rap.users (`id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT, `username` VARCHAR(32) NOT NULL, `password` VARCHAR(128) NOT NULL, `admin` ENUM('0', '1', '2') NOT NULL);");
db.query("CREATE TABLE IF NOT EXISTS db_rap.valid_quotes (`id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT, `quote` VARCHAR(256) NOT NULL, `artist` VARCHAR(32) NOT NULL, `track` VARCHAR(128) NOT NULL, `year` VARCHAR(4) NOT NULL, `suggested_by` VARCHAR(32) NOT NULL, `validated_by` VARCHAR(32) NOT NULL);");
db.query("CREATE TABLE IF NOT EXISTS db_rap.pending_quotes (`id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT, `quote` VARCHAR(256) NOT NULL, `artist` VARCHAR(32) NOT NULL, `track` VARCHAR(128) NOT NULL, `year` VARCHAR(4) NOT NULL, `suggested_by` VARCHAR(32) NOT NULL);");
db.query("CREATE TABLE IF NOT EXISTS db_rap.invalid_quotes (`id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT, `quote` VARCHAR(256) NOT NULL, `artist` VARCHAR(32) NOT NULL, `track` VARCHAR(128) NOT NULL, `year` VARCHAR(4) NOT NULL, `suggested_by` VARCHAR(32) NOT NULL, `unvalidated_by` VARCHAR(32) NOT NULL);");

app.listen(8081);