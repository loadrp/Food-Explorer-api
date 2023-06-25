exports.up = function(knex) {
  return knex.schema.createTable('tags', function(table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).nullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).nullable();
    table.integer('food_id');
    table.integer('user_id').notNullable();

    table.foreign('food_id').references('id').inTable('foods').onDelete('CASCADE');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('tags');
};
