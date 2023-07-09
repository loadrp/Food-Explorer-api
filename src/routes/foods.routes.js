const { Router } = require("express");
const multer = require("multer");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");
const FoodController = require("../controllers/FoodController");
const FoodImageController = require("../controllers/FoodImageController");
const uploadConfig = require("../configs/upload");

const upload = multer({
  dest: uploadConfig.TMP_FOLDER,
});

const foodController = new FoodController();
const foodImageController = new FoodImageController();

const foodsRoutes = Router();

foodsRoutes.use(ensureAuthenticated);

// Rota para listar todas as comidas
foodsRoutes.get("/", foodController.index);

// Rota para criar uma nova comida
foodsRoutes.post("/", upload.single("image"), foodController.create);

// Rota para obter detalhes de uma comida específica
foodsRoutes.get("/:id", foodController.show);

// Rota para excluir uma comida
foodsRoutes.delete("/:id", foodController.delete);

// Rota para atualizar a imagem de uma comida
foodsRoutes.put("/:id/image", upload.single("image"), foodImageController.update);

module.exports = foodsRoutes;
