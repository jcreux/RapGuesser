exports.errSignup = (req, res, error) => {
	res.render("index", {
		username: req.body.su_username,
		email: req.body.su_email,
		error
	});
}