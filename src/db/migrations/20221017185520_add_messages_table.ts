import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("messages", (table) => {
    table.increments("id").primary().unique();
    table.integer("userId").references("users.id").notNullable();
    table.text("message").notNullable();
    table.integer("friendId");
    table.integer("groupId").references("groups.id");
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("messages");
}
