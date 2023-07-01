

exports.up = function(knex) {
  return knex.schema.createTable('foods', function(table) {
    table.increments('id').unsigned().primary();
    table.integer('category_id').unsigned().notNullable().references('id').inTable('categories');
    table.string('name').notNullable();
    table.string('description').notNullable();
    table.float('price').notNullable();
    table.integer('user_id').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).nullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('foods');
};