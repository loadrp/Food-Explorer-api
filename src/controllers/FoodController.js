const knex = require("../database/knex");

class FoodController {
  async create(request, response) {
    try {
      const { name, price, description, category_name, tags } = request.body;
   

      const [categoryInsert] = await knex('categories').insert({
          name: category_name,
      });
    

      // Insere a comida no banco de dados
      const [food_id] = await knex('foods').insert({
        name,
        description,
        price,
        user_id: request.user.id,
        category_id: categoryInsert
      });

      // Insere as tags relacionadas à comida
      const tagsInsert = tags.map(tag => {
        return {
          food_id,
          name:tag,
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
  
        foods = await knex("foods")
        .select(["foods.id", "foods.name", "foods.user_id"])
        .where("foods.user_id", user_id)
        .where("foods.name", "like", `%${title}%`)
        .whereIn("foods.id", function () {
          this.select("food_id").from("tags").whereIn("name", filterTags);
        })
        .orderBy("foods.name");
      } else {
        foods = await knex("foods")
          .where({ user_id })
          .where("name", "like", `%${title}%`)
          .orderBy("name");
      }
  
      const foodIds = foods.map(food => food.id);
      const tagsQuery = await knex("tags").whereIn("food_id", foodIds);
      const foodWithTags = foods.map(food => {
        const foodTags = tagsQuery.filter(tag => tag.food_id === food.id);
        return {
          ...food,
          tags: foodTags,
        };
      });

      return response.json(foodWithTags);
    } catch (error) {
      console.error(error);
      return response.status(500).json({ success: false, message: 'Ocorreu um erro ao buscar as comidas.' });
    }
  }
}

module.exports = FoodController;