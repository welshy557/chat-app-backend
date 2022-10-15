import knex from "knex";
import * as dotenv from "dotenv";
import path from "path";
const knexfile = require("./knexfile");
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
const env =
  process.env.PRODUCTION === "TRUE"
    ? knexfile.production
    : knexfile.development;

const db = knex(env);

export default db;
