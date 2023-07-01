const knex = require("../database/knex");

class FoodController {
  async create(request, response) {
    try {
      const { name, price, description, category_name, tags } = request.body;
  
      // Check if the category already exists in the database
      const [existingCategory] = await knex('categories').select('id').where('name', category_name);
  
      let category_id;
  
      if (existingCategory) {
        // Use the existing category_id if a matching category is found
        category_id = existingCategory.id;
      } else {
        // Insert a new category if a matching category is not found
        const [newCategory] = await knex('categories').insert({ name: category_name });
        category_id = newCategory;
      }
  
      // Insert the food item into the database
      const [food_id] = await knex('foods').insert({
        name,
        description,
        price,
        user_id: request.user.id,
        category_id
      });
  
      // Insert the tags for the food item into the database
      const tagsInsert = tags.map(tag => {
        return {
          food_id,
          name: tag,
          user_id: request.user.id
        };
      });
  
      await knex('tags').insert(tagsInsert);
  
      response.json({ success: true, message: 'Comida criada com sucesso!', });
    } catch (error) {
      console.error(error);
      response.status(500).json({ success: false, message: 'Ocorreu um erro ao criar a comida.' });
    }
  }

  async show(request, response) {
    const {id} = request.params;

    const food = await knex("foods").where({id}).first();
    const tags = await knex("tags").where({food_id: id}).orderBy("name");
    const category = await knex("categories").where({ id: food.category_id }).first();

    return response.json({
      ...food,
      category,
      tags,
      
    })
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
        .whereIn('foods.id', foodIds)
        .orderBy('foods.name');
  
      response.json(foodWithTags.map(food => ({
        id: food.id,
        name: food.name,
        description: food.description,
        price: food.price,
        category_name: food.category_name,
        tags: tagsQuery.filter(tag => tag.food_id === food.id)
      })));
    } catch (error) {
      console.error(error);
      response.status(500).json({ success: false, message: 'Ocorreu um erro ao buscar as comidas.' });
    }
  }
}

module.exports = FoodController;