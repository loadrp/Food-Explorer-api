const knex = require("../database/knex");
const AppError = require("../utils/AppError");
const DiskStorage = require("../providers/DiskStorage");

class FoodImageController {
  async update(request, response) {
    const food_id = request.params.id;
    const imageFileName = request.file.filename;
    const diskStorage = new DiskStorage();

    const food = await knex("foods")
      .where({ id: food_id })
      .first();

    if (!food) {
      throw new AppError("Comida não encontrada.", 404);
    }

    if (food.image_path) {
      await diskStorage.deleteFile(food.image_path);
    }

    const imagePath = await diskStorage.saveFile(imageFileName);
    food.image_path = imagePath;

    await knex("foods").update(food).where({ id: food_id });
    return response.json(food);
  }
}

module.exports = FoodImageController;