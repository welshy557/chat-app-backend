import { Router, Response } from "express";
import authenticateToken from "../routeMiddleware/auth-token";
import { ApiRequest } from "..";
import db from "../db/db";
import { Knex } from "knex";
import { Message } from "../dbModels";

const message = Router();

message.get(
  "/messages",
  authenticateToken,
  async (req: ApiRequest, res: Response) => {
    try {
      const msgs = await db<Message>("messages")
        .select()
        .where({ userId: req.user?.id });
      res.status(200).send(msgs);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  }
);

message.get(
  "/messages/:friendId",
  authenticateToken,
  async (req: ApiRequest, res: Response) => {
    try {
      const { friendId } = req.params;

      const msgs = await db.transaction(async (trx: Knex.Transaction) => {
        if (!req.user) {
          console.error(`No Authenticated User`);
          res.status(403).send("Unauthorized");
          return;
        }
        const sentMessages = await trx<Message>("messages")
          .select()
          .where({ userId: req.user.id, friendId: parseInt(friendId) });

        const recievedMessages = await trx<Message>("messages")
          .select()
          .where({ userId: parseInt(friendId), friendId: req.user?.id });

        return [...recievedMessages, ...sentMessages];
      });

      res.status(200).send(msgs);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  }
);

export default message;
