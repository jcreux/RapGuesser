const mysql = require("mysql2");

const db = mysql.createConnection({
	host: "127.0.0.1",
	user: "root",
	password: "rootroot"
});

db.query("CREATE DATABASE IF NOT EXISTS `db_rap` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci");

module.exports = db.promise();