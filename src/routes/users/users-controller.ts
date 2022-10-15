import express, { Response, Request } from "express";
import bcrypt from "bcrypt";

import authenticateToken from "../../routeMiddleware/auth-token";
import db from "../../db/db";
import { ApiRequest } from "../..";
import { Friend, User } from "../../dbModels";
import * as UserStore from "./user-store";
import { Knex } from "knex";

const user = express.Router();

user.get("/users", async (_, res: Response) => {
  const users: Omit<User, "password">[] = await db("users").select(
    "id",
    "firstName",
    "lastName",
    "email"
  );

  await db.transaction(async (trx: Knex.Transaction) => {
    const usersResponse = await Promise.all(
      users.map(async (user) => ({
        ...user,
        friends: await UserStore.getUsersFriends(user, trx),
      }))
    );

    res.status(200).send(usersResponse);
  });
});

user.get("/users/:id", async (req: ApiRequest, res: Response) => {
  try {
    const { id } = req.params;

    await db.transaction(async (trx: Knex.Transaction) => {
      const user: Omit<User, "password"> | undefined = await trx<User>("users")
        .select("id", "firstName", "lastName", "email")
        .where({ id: parseInt(id) })
        .first();

      if (!user) {
        console.error(`User with id ${id} not found`);
        res.status(401).send(`User with id ${id} not found`);
        return;
      }

      const friends = await UserStore.getUsersFriends(user, trx);

      const userResponse: Omit<User, "password"> = {
        ...user,
        friends: friends,
      };
      res.status(200).send(userResponse);
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

user.get(
  "/loggedIn",
  authenticateToken,
  async (req: ApiRequest, res: Response) => {
    try {
      res.status(200).send({
        id: req?.user?.id,
        firstName: req.user?.firstName,
        lastName: req.user?.lastName,
        email: req.user?.email,
      });
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  }
);

user.post("/users", async (req: ApiRequest, res: Response) => {
  try {
    const { firstName, lastName, email } = req.body as User;
    const password = await bcrypt.hash(req.body.password, 10);
    const user: Omit<User, "id"> = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
    };

    await db<User>("users").insert(user);
    res.status(200).send("Success");
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

user.put(
  "/users/:id",
  authenticateToken,
  async (req: ApiRequest, res: Response) => {
    try {
      await db.transaction(async (trx: Knex.Transaction) => {
        const { id } = req.params;
        const { firstName, lastName, email, password, friends, posts } =
          req.body;

        const existingFriends = req.user
          ? await UserStore.getUserFriendsCorrelations(req.user, trx)
          : [];
        await Promise.all(
          friends.map((friend: Friend) => {
            const friendExists = existingFriends.some(
              (existingFriend) => existingFriend.friendId === friend.friendId
            );
            if (!friendExists) {
              return trx<Friend>("friends").insert({
                friendId: friend.friendId,
                userId: req.user?.id,
              });
            }
          })
        );

        if (firstName || lastName || email || password) {
          if (password) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            await trx<User>("users")
              .where({ id: parseInt(id) })
              .update({ firstName, lastName, email, password: hashedPassword });
          } else {
            await trx<User>("users")
              .where({ id: parseInt(id) })
              .update({ firstName, lastName, email });
          }
        }
      });

      res.status(200).send("Success");
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  }
);

export default user;
