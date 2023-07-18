const knex = require("../database/knex");
const uploadConfig = require("../configs/upload");
const DiskStorage = require('../providers/DiskStorage');
const diskStorage = new DiskStorage();



class FoodController {
  async create(request, response) {
    try {
      const { name, price, description, category_name, tags } = request.body;
      console.log(request.body);

      // Check if the category already exists in the database
      const [existingCategory] = await knex('categories').select('id').where('name', category_name);
      const fileName = await diskStorage.saveFile(request.file);
      const imagePath = fileName ? `/files/${fileName}` : null;
  

      let category_id;

      if (existingCategory) {
        // Use the existing category_id if a matching category is found
        category_id = existingCategory.id;
      } else {
        // Insert a new category if a matching category is not found
        const [newCategory] = await knex('categories').insert({ name: category_name });
        category_id = newCategory;
      }

      // Insert the food item into the database, including the image path
      const [food_id] = await knex('foods').insert({
        name,
        description,
        price,
        user_id: request.user.id,
        category_id,
        image: fileName
      });

      // Parse tags back into an array if it is a JSON string
      let tagsArray = null;

if (typeof tags === 'string') {
  try {
    tagsArray = JSON.parse(tags);
  } catch (error) {
    console.error('Failed to parse tags:', error);
  }
} else if (Array.isArray(tags)) {
  tagsArray = tags;
} else {
  console.error('Tags need to be a valid JSON string or an array. Ignoring tags.');
}

if (tagsArray) {
  // Insert the tags for the food item into the database
  const tagsInsert = tagsArray.map(tag => {
    return {
      food_id,
      name: tag,
      user_id: request.user.id
    };
  });

  await knex('tags').insert(tagsInsert);
}

      response.json({ success: true, message: 'Comida criada com sucesso!', food_id, image: imagePath });
    } catch (error) {
      console.error(error);
      response.status(500).json({ success: false, message: 'Ocorreu um erro ao criar a comida.' });
    }
  }

  async show(request, response) {
    const { category } = request.query;
    const { id } = request.params
    const user_id = request.user.id;

    try {
      let query = knex('foods')
        .join('categories', 'foods.category_id', 'categories.id')
        .select('foods.id', 'foods.name', 'foods.description', 'foods.price', 'foods.user_id', 'foods.category_id', 'categories.name as category_name')
        .where({ 'foods.user_id': user_id });

      if (id) {
        query = query.where('foods.id', id);
      }

      if (category) {
        query = query.where('categories.name', category);
      }

      const foods = await query;

      return response.json(foods);
    } catch (error) {
      console.error(error);
      return response.status(500).json({ success: false, message: 'Ocorreu um erro ao buscar as comidas.' });
    }
  }

  async delete(request, response) {
    const { id } = request.params;

    try {
      const deletedCount = await knex("foods").where({ id }).delete();

      if (deletedCount === 0) {
        return response.status(404).json({ success: false, message: 'Comida não encontrada.' });
      }

      return response.json({ success: true, message: 'Comida excluída com sucesso.' });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ success: false, message: 'Ocorreu um erro ao excluir a comida.' });
    }
  }

  async index(request, response) {
    const { title, tags } = request.query;
    const user_id = request.user.id;

    try {
      let foods;

      if (tags) {
        const filterTags = tags.split(',').map(tag => tag.trim());

        foods = await knex('foods')
          .select(['foods.id', 'foods.name', 'foods.user_id'])
          .where('foods.user_id', user_id)
          .where('foods.name', 'like', `%${title}%`)
          .whereIn('foods.id', function () {
            this.select('food_id').from('tags').whereIn('name', filterTags);
          })
          .orderBy('foods.name');
      } else {
        foods = await knex('foods')
          .where({ user_id })
          .where('name', 'like', `%${title}%`)
          .orderBy('name');
      }

      const foodIds = foods.map(food => food.id);
      const tagsQuery = await knex('tags').whereIn('food_id', foodIds);
      const foodWithTags = await knex('foods')
        .join('categories', 'foods.category_id', 'categories.id')
        .select('foods.*', 'categories.name as category_name')
        .where('foods.name', 'like', `%${title}%`)
        .whereIn('foods.id', foodIds)
        .orderBy('foods.name');

      response.json(foodWithTags.map(food => ({
        id: food.id,
        name: food.name,
        description: food.description,
        price: food.price,
        category_name: food.category_name,
        image: `${request.protocol}://${request.get('host')}/files/${food.image}`,
        tags: tagsQuery.filter(tag => tag.food_id === food.id)
      })));
    } catch (error) {
      console.error(error);
      response.status(500).json({ success: false, message: 'Ocorreu um erro ao buscar as comidas.' });
    }
  }
}

module.exports = FoodController;