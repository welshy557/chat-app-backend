import { Knex } from "knex";
import { User } from "../../dbModels";
import bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export async function seed(knex: Knex): Promise<void> {
  if (!process.env.ADMIN_USER_PASS) {
    throw new Error("Missing admin password in env");
  }

  const passwordPromies: Promise<string>[] = [];

  for (let i = 0; i < 4; i++) {
    passwordPromies.push(bcrypt.hash(process.env.ADMIN_USER_PASS, 10));
  }

  const passwords: string[] = await Promise.all(passwordPromies);

  await knex<User>("users").insert([
    {
      firstName: "Server",
      lastName: "Admin",
      email: "admin@chatapp.com",
      password: passwords[0],
    },
    {
      firstName: "Liam",
      lastName: "Welsh",
      email: "test@gmail.com",
      password: passwords[1],
    },
    {
      firstName: "Bill",
      lastName: "Joe",
      email: "test1@gmail.com",
      password: passwords[2],
    },
    {
      firstName: "Ronald",
      lastName: "McDonald",
      email: "test2@gmail.com",
      password: passwords[3],
    },
  ]);
}
