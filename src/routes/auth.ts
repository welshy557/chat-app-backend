import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv";

import db from "../db/db";
import authenticateToken from "../routeMiddleware/auth-token";
import { User } from "../dbModels";

const auth = express.Router();

auth.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db<User>("users").where({ email: email }).first();
    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = user;
      const token = jwt.sign(payload, process.env.JWT_SECRET_KEY as string, {
        expiresIn: "24h",
      });
      return res.status(200).send({ token });
    }

    res.status(403).send("Invalid email/password");
  } catch (err) {
    res.status(500).send(err);
  }
});

auth.get("/validate", authenticateToken, (_, res) => {
  res.status(200).send("authorized");
});

export default auth;
