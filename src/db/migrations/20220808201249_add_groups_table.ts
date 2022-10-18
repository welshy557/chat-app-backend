import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("groups", (table) => {
    table.increments("id").primary().unique();
    table.string("name").notNullable();
    table.integer("userId").references("users.id").notNullable();
    table.specificType("friends", "integer[]");
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("groups");
}
