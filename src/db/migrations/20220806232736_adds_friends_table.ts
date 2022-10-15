import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("friends", (table) => {
    table.increments("id").primary().unique();
    table.integer("userId").references("users.id").notNullable();
    table.integer("friendId").references("users.id").notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("friends");
}
