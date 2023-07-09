exports.up = function(knex) {
  return knex.schema.table('foods', function(table) {
    table.string('image').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('foods', function(table) {
    table.dropColumn('image');
  });
};