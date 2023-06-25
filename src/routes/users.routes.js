const { Router } = require("express");
const multer = require("multer")
const uploadConfig = require('../configs/upload')

const ensureAuthenticated = require("../middlewares/ensureAuthenticated");
const UserController = require("../controllers/UserController")
const UserAvatarController = require("../controllers/UserAvatarController")

const usersRoutes = Router();
const usersController = new UserController()
const userAvatarController = new UserAvatarController();
const upload = multer(uploadConfig.MULTER);


usersRoutes.post("/", usersController.create)
usersRoutes.put("/", ensureAuthenticated , usersController.update)
usersRoutes.patch("/avatar", ensureAuthenticated , upload.single("avatar"), userAvatarController.update)

module.exports = usersRoutes;