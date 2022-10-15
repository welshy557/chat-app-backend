import express from "express";
import { ApiRequest } from "..";
import db from "../db/db";
import { Friend, FriendRequest, User } from "../dbModels";
import authenticateToken from "../routeMiddleware/auth-token";
import { Knex } from "knex";

const friendRequests = express.Router();

friendRequests.get(
  "/friend-requests",
  authenticateToken,
  async (req: ApiRequest, res) => {
    try {
      const friendRequestsUsers = await db.transaction(
        async (trx: Knex.Transaction) => {
          const requests = await trx<FriendRequest>("friend_requests")
            .select()
            .where({ friendId: req.user?.id });

          const users = await Promise.all(
            requests.map((request) =>
              trx<User>("users")
                .first("id", "firstName", "lastName", "email")
                .where({ id: request.userId })
            )
          );
          const friendRequestsUsers = users.map((user, i) => ({
            ...user,
            created_at: requests[i].created_at,
            updated_at: requests[i].updated_at,
          }));
          return friendRequestsUsers;
        }
      );

      res.status(200).send(friendRequestsUsers);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  }
);

friendRequests.post(
  "/friend-requests",
  authenticateToken,
  async (req: ApiRequest, res) => {
    try {
      let transactionError = false;
      await db.transaction(async (trx: Knex.Transaction) => {
        if (req.body.email === req.user?.email) {
          console.error("User can not add themself");
          transactionError = true;
          res.status(401).send("User can not add themsef");
          return;
        }

        const usersFriends: Friend[] = await trx<Friend>("friends")
          .select()
          .where({ userId: req.user?.id });

        const requesteeUserId: number | undefined = // User being added
          (await trx<User>("users").first().where({ email: req.body.email }))
            ?.id;

        if (!requesteeUserId) {
          res.status(404).send(`User with email ${req.body.email} not found`);
          console.error(`User with email ${req.body.email} not found`);
          transactionError = true;
          return;
        }

        const userIsFriendsWithRequestee = usersFriends.some(
          ({ userId, friendId }) =>
            userId === req.user?.id && friendId === requesteeUserId
        );
        if (userIsFriendsWithRequestee) {
          res
            .status(401)
            .send(`User is already friends with ID: ${requesteeUserId}`);
          console.error(`User is already friends with ID: ${requesteeUserId}`);
          transactionError = true;
          return;
        }

        await trx<FriendRequest>("friend_requests").insert({
          friendId: requesteeUserId,
          userId: req.user?.id,
        });
      });

      if (transactionError) return;

      res.status(200).send("Success");
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  }
);

friendRequests.post(
  "/accept-friend-request",
  authenticateToken,
  async (req: ApiRequest, res) => {
    try {
      let transactionError = false;
      await db.transaction(async (trx: Knex.Transaction) => {
        const friendRequest: FriendRequest | undefined =
          await trx<FriendRequest>("friend_requests")
            .first()
            .where({
              friendId: req.user?.id,
              userId: parseInt(req.body.friendId),
            });
        if (!friendRequest) {
          res
            .status(404)
            .send(
              `Friend Request with FriendID ${req.body.friendId} and UserId ${req.user?.id} not found`
            );
          console.error(
            `Friend Request with FriendID ${req.body.friendId} and UserId ${req.user?.id} not found`
          );
          transactionError = true;
          return;
        }

        await trx<Friend>("friends").insert({
          friendId: friendRequest.friendId,
          userId: friendRequest.userId,
        });
        await trx<Friend>("friends").insert({
          friendId: friendRequest.userId,
          userId: friendRequest.friendId,
        });

        await trx<FriendRequest>("friend_requests").delete().where({
          friendId: friendRequest.friendId,
          userId: friendRequest.userId,
        });
      });

      if (transactionError) return;
      res.status(200).send("success");
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  }
);

friendRequests.delete(
  "/friend-requests/:friendId",
  authenticateToken,
  async (req: ApiRequest, res) => {
    try {
      console.log("friendId", req.params.friendId);
      await db<FriendRequest>("friend_requests")
        .delete()
        .where({
          userId: parseInt(req.params.friendId),
          friendId: req.user?.id,
        });
      res.status(200).send("success");
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  }
);

export default friendRequests;
