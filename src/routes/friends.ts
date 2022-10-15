import express, { Response } from "express";

import authenticateToken from "../routeMiddleware/auth-token";
import db from "../db/db";
import { ApiRequest } from "..";
import { Knex } from "knex";
import { Friend, User } from "../dbModels";

const friends = express.Router();

friends.get(
  "/friends",
  authenticateToken,
  async (req: ApiRequest, res: Response) => {
    try {
      const friends = await db.transaction(async (trx: Knex.Transaction) => {
        const friends = await trx<Friend>("friends")
          .select()
          .where({ userId: req.user?.id });

        const friendsUsers = await Promise.all(
          friends.map((friend) =>
            trx<User>("users")
              .first("id", "email", "firstName", "lastName")
              .where({ id: friend.friendId })
          )
        );
        return friendsUsers;
      });
      res.status(200).send(friends);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  }
);

friends.post(
  "/friends",
  authenticateToken,
  async (req: ApiRequest, res: Response) => {
    try {
      await db.transaction(async (trx: Knex.Transaction) => {
        await trx<Friend>("friends").insert({
          ...req.body,
          userId: req.user?.id,
        });
        await trx<Friend>("friends").insert({
          friendId: req.user?.id,
          userId: req.body.friendId,
        });
      });
      res.status(200).send("Success");
    } catch (err) {
      res.status(500).send(err);
    }
  }
);

friends.delete(
  "/friends/:friendId",
  authenticateToken,
  async (req: ApiRequest, res: Response) => {
    try {
      const { friendId } = req.params;
      await db.transaction(async (trx: Knex.Transaction) => {
        await trx<Friend>("friends")
          .where({ friendId: parseInt(friendId), userId: req.user?.id })
          .del();

        await trx<Friend>("friends")
          .where({ userId: parseInt(friendId), friendId: req.user?.id })
          .del();
      });

      res.status(200).send("Success");
    } catch (err) {
      res.status(500).send(err);
    }
  }
);
export default friends;
