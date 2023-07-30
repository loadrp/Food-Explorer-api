const { Router } = require("express");
const multer = require("multer")
const uploadConfig = require('../configs/upload')

const ensureAuthenticated = require("../middlewares/ensureAuthenticated");
const UserController = require("../controllers/UserController")

const usersRoutes = Router();
const usersController = new UserController()
const upload = multer(uploadConfig.MULTER);


usersRoutes.post("/", usersController.create)
usersRoutes.put("/", ensureAuthenticated , usersController.update)

module.exports = usersRoutes;