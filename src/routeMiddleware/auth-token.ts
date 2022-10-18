import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { ApiRequest } from "../index";
import dotenv from "dotenv";
import { User } from "../dbModels";
dotenv.config();

const authenticateToken = (
  req: ApiRequest,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;
  const token = authorization && authorization?.split(" ")[1];
  if (!token) {
    return res.status(403).send("Unauthorized");
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY as string, (err, user) => {
    if (err) {
      return res.status(403).send("Unauthorized");
    }
    req.user = user as User;
    next();
  });
};

export default authenticateToken;
