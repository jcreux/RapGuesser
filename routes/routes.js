const express = require("express");
const controller = require('../controller/controller');
const router = express.Router();

router.get("/", controller.getIndex);

router.post("/signup", controller.postSignUp);

router.post("/signin", controller.postSignIn);

router.get("/main", controller.getMain);

router.get("/play", controller.getPlay);

router.get("/check", controller.getCheck);

router.post("/check", controller.postCheck);

router.get("/add", controller.getAdd);

router.post("/add", controller.postAdd);

router.get("/manage", controller.getManage);

router.get("/valid/:id(\\d+)", controller.getValid);

router.get("/modify/:id(\\d+)", controller.getModify);

router.post("/modify/:id(\\d+)", controller.postModify);

router.get("/unvalid/:id(\\d+)", controller.getUnvalid);

router.get("/list_admin", controller.getListAdmin);

router.get("/upgrade/:id(\\d+)", controller.getUpgrade);

router.get("/downgrade/:id(\\d+)", controller.getDowngrade);

module.exports = router;