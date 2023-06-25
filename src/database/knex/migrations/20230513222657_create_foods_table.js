exports.up = function(knex) {
  return knex.schema.createTable('foods', function(table) {
    table.increments('id').unsigned().primary();
    table.string('name').notNullable();
    table.string('description').notNullable();
    table.string('price').notNullable();
    table.integer('category_id');
    table.integer('user_id').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).nullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).nullable();

    table.foreign('category_id').references('id').inTable('categories');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('foods');
};
