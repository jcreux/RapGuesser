const hasha = require("hasha");
const db = require("../database/db");
const errors = require("../models/errors");

exports.get404 = (req, res) => {
	if (req.session.id_user) {
		res.redirect("/main");
	} else {
		res.redirect("/");
	};
}

exports.getIndex = (req, res) => {
	res.render("index", {
		username: "",
		email: "",
		error: ""
	});
};

exports.postSignUp = (req, res) => {
	let form = [req.body.su_username, req.body.su_email, req.body.su_password, req.body.su_cpassword];

    form[1].match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{1,4}/g) ? check_email = 0 : check_email = 1;
	form[2].match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.,;:'"`˜#$^+*=!?/\\\-\_\[\]<>(){}|@%&§±]).{8,32}$/g) ? check_password = 0 : check_password = 1;

	for (i = 0; i < form.length; i++) {
		if (!form[i]) {
			return (errors.errSignup(req, res, "Veuillez remplir tous les champs."));
		}
	}
	if (form[0].length > 32) {
		return (errors.errSignup(req, res, "Le username saisi est trop long."));
	} else if (form[1].length > 128) {
		return (errors.errSignup(req, res, "L'email saisi est trop long."));
	} else if (form[2].length > 32) {
		return (errors.errSignup(req, res, "Le mot de passe saisi est trop long."));
	} else if (check_email === 1) {
		return (errors.errSignup(req, res, "Mauvais format d'email."));
	} else if (check_password === 1) {
		return (errors.errSignup(req, res, "Mauvais format de mot de passe."));
	} else if (form[2] !== form[3]) {
		return (errors.errSignup(req, res, "Veuillez saisir deux fois le même mot de passe."));
	} else {
		db.query("SELECT username FROM db_rap.users WHERE username = ?;", form[0]).then((result) => {
			if (result[0].length === 1) {
				return (errors.errSignup(req, res, "Cet username est déjà utilisé."));
			} else {
				db.query("SELECT email FROM db_rap.users WHERE email = ?;", form[1]).then((result) => {
					if (result[0].length === 1) {
						return (errors.errSignup(req, res, "Cet email est déjà utilisé."));
					} else {
						db.query("INSERT INTO db_rap.users (`username`, `email`, `password`, `admin`) VALUES (?, ?, ?, ?);", [form[0], form[1], hasha(form[2]), '0']);
						res.redirect("/");
					}
				});
			}
		});
	}
}

exports.postSignIn = (req, res) => {
	let form = [req.body.si_username, req.body.si_password];

	db.query("SELECT * FROM db_rap.users WHERE `username` = ? and `password` = ?;", [form[0], hasha(form[1])]).then((result) => {
		if (result[0].length === 1) {
			req.session.id_user = result[0][0].id;
			req.session.admin = result[0][0].admin;
			res.redirect("/main");
		} else {
			res.redirect("/");
		}
	});
};

exports.getMain = (req, res) => {
	req.session.game_id = 0;
	res.render("main", {
		admin: req.session.admin
	});
};

exports.getPlay = (req, res) => {
	if (req.session.game_id === 0) {
		req.session.game_id = 1;
		db.query("SELECT `id`, `quote`, `artist` FROM db_rap.valid_quotes;").then((result) => {
			let c = Math.floor(Math.random() * 4);
			let artists = [];

			for (i = 0; i < 4; i++) {
				let r = Math.floor(Math.random() * result[0].length);

				for (j = 0; j < artists.length; j++) {
					if (artists[j] === result[0][r].artist) {
						r = Math.floor(Math.random() * result[0].length);
						j = -1;
					}
				}
				if (i === c) {
					req.session.quote = result[0][r].quote;
					req.session.artist = result[0][r].artist;
				}
				artists[i] = result[0][r].artist;
			}
			req.session.artists = artists;
			res.render("play", {
				quote: req.session.quote,
				options: req.session.artists
			});
		});
	} else if (req.session.game_id === 1) {
		res.redirect("main");
	}
};

exports.getCheck = (req, res) => {
	req.session.game_id = 0;
	res.render("check", {
		token: "ko",
		quote: req.session.quote,
		artist: req.session.artist,
		options: req.session.artists
	})
}

exports.postCheck = (req, res) => {
	let artist = req.body.button;
	let quote = req.session.quote;

	req.session.game_id = 0;
	if (artist === req.session.artist) {
		res.render("check", {
			token: "ok",
			quote: quote,
			artist: req.session.artist,
			options: req.session.artists
		});
	} else {
		res.render("check", {
			token: "ko",
			quote: quote,
			artist: req.session.artist,
			options: req.session.artists
		});
	}
}

exports.getAdd = (req, res) => {
	res.render("add");
};

exports.postAdd = (req, res) => {
	let form = [req.body.quote, req.body.artist, req.body.track, req.body.year];

	db.query("INSERT INTO db_rap.pending_quotes (`quote`, `artist`, `track`, `year`, `suggested_by`) VALUES (?, ?, ?, ?, ?);", [form[0], form[1], form[2], form[3], req.session.id_user]);
	res.redirect("/add");
};

exports.getManage = (req, res) => {
	if (req.session.admin) {
		if (req.session.admin === '1' || req.session.admin === '2') {
			let usernames = [];

			db.query("SELECT * FROM db_rap.pending_quotes;").then(async (result) => {
				for (i = 0; i < result[0].length; i++) {
					await db.query("SELECT `username` FROM db_rap.users WHERE `id` = ?;", result[0][i].suggested_by).then((result) => {
						usernames[i] = result[0][0].username;
					});
				}
				res.render("manage", {
					infos: result[0],
					usernames: usernames
				});
			});
		} else {
			res.redirect("/main");
		}
	} else {
		res.redirect("/");
	}
};

exports.getValid = (req, res) => {
	let id_quote = req.url.split("/")[2];

	db.query("SELECT * FROM db_rap.pending_quotes WHERE `id` = ?;", id_quote).then((result) => {
		let infos = [result[0][0].quote, result[0][0].artist, result[0][0].track, result[0][0].year, result[0][0].suggested_by, req.session.id_user];

		db.query("INSERT INTO db_rap.valid_quotes (`quote`, `artist`, `track`, `year`, `suggested_by`, `validated_by`) VALUES (?, ?, ?, ?, ?, ?);", [infos[0], infos[1], infos[2], infos[3], infos[4], infos[5]]).then(() => {
			db.query("DELETE FROM db_rap.pending_quotes WHERE `id` = ?;", id_quote);
		});
	});
	res.redirect("/manage");
};

exports.getModify = (req, res) => {
	let id_quote = req.url.split("/")[2];

	db.query("SELECT * FROM db_rap.pending_quotes WHERE `id` = ?;", id_quote).then((result) => {
		let infos = [result[0][0].quote, result[0][0].artist, result[0][0].track, result[0][0].year];

		res.render("modify", {
			id: id_quote,
			infos: infos
		});
	});
}

exports.postModify = (req, res) => {
	let id_quote = req.url.split("/")[2];
	let form = [req.body.quote, req.body.artist, req.body.track, req.body.year];

	db.query("UPDATE db_rap.pending_quotes SET `quote` = ?, `artist` = ?, `track` = ?, `year` = ? WHERE `id` = ?;", [form[0], form[1], form[2], form[3], id_quote]);
	res.redirect("/manage");
}

exports.getUnvalid = (req, res) => {
	let id_quote = req.url.split("/")[2];

	db.query("SELECT * FROM db_rap.pending_quotes WHERE `id` = ?;", id_quote).then((result) => {
		let infos = [result[0][0].quote, result[0][0].artist, result[0][0].track, result[0][0].year, result[0][0].suggested_by, req.session.id_user];

		db.query("INSERT INTO db_rap.invalid_quotes (`quote`, `artist`, `track`, `year`, `suggested_by`, `unvalidated_by`) VALUES (?, ?, ?, ?, ?, ?);", [infos[0], infos[1], infos[2], infos[3], infos[4], infos[5]]).then(() => {
			db.query("DELETE FROM db_rap.pending_quotes WHERE `id` = ?;", id_quote);
		});
	});
	res.redirect("/manage");
};

exports.getListAdmin = (req, res) => {
	if (req.session.admin) {
		if (req.session.admin === '2') {
			db.query("SELECT `id`, `username`, `admin` FROM db_rap.users;").then((result) => {
				res.render("list_admin", {
					infos: result[0]
				});
			});
		} else {
			res.redirect("/main");
		}
	} else {
		res.redirect("/");
	}
}

exports.getUpgrade = (req, res) => {
	if (req.session.admin) {
		if (req.session.admin === '2') {
			let id_user = req.url.split("/")[2];

			db.query("SELECT `admin` FROM db_rap.users WHERE `id` = ?;", id_user).then((result) => {
				if (result[0][0].admin === '0') {
					db.query("UPDATE db_rap.users SET `admin` = '1' WHERE `id` = ?", id_user);
				} else if (result[0][0].admin === '1') {
					db.query("UPDATE db_rap.users SET `admin` = '2' WHERE `id` = ?", id_user);
				}
			});
			res.redirect("/list_admin");
		} else {
			res.redirect("/main");
		}
	} else {
		res.redirect("/");
	}
}

exports.getDowngrade = (req, res) => {
	if (req.session.admin) {
		if (req.session.admin === '2') {
			let id_user = req.url.split("/")[2];

			db.query("SELECT `admin` FROM db_rap.users WHERE `id` = ?;", id_user).then((result) => {
				if (result[0][0].admin === '1') {
					db.query("UPDATE db_rap.users SET `admin` = '0' WHERE `id` = ?", id_user);
				} else if (result[0][0].admin === '2') {
					db.query("UPDATE db_rap.users SET `admin` = '1' WHERE `id` = ?", id_user);
				}
			});
			res.redirect("/list_admin");
		} else {
			res.redirect("/main");
		}
	} else {
		res.redirect("/");
	}
}