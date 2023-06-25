const { Router } = require("express");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");

const FoodController = require("../controllers/FoodController")
const foodsRoutes = Router();
const foodController = new FoodController()

foodsRoutes.use(ensureAuthenticated);

foodsRoutes.get("/",   foodController.index)
foodsRoutes.post("/",   foodController.create)
foodsRoutes.get("/:id",   foodController.show)
foodsRoutes.delete("/:id",   foodController.delete)

module.exports = foodsRoutes;