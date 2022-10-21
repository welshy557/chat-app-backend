import { Response, Router } from "express";
import { ApiRequest } from "..";
import db from "../db/db";
import { Group, Message, User } from "../dbModels";
import authenticateToken from "../routeMiddleware/auth-token";

const groups = Router();

groups.get(
  "/groups",
  authenticateToken,
  async (req: ApiRequest, res: Response) => {
    try {
      const { user } = req;
      const groups: Group[] = await db.transaction(async (trx) => {
        const groupsNoMessage: Omit<Group, "messages">[] = await trx<Group>(
          "groups"
        )
          .select()
          .where({ userId: user?.id })
          .orWhereRaw("? = ANY(friends)", user?.id);

        const messages: Message[][] = await Promise.all(
          groupsNoMessage.map((group) =>
            trx<Message>("messages").select().where({ id: group.id })
          )
        );

        const groupsWithMessages = groupsNoMessage.map((group) => {
          const groupMessages = messages.find(([msg]) => {
            if (msg?.groupId) {
              return msg.groupId === group.id;
            } else return false;
          });
          return { ...group, messages: groupMessages ?? [] } as Group;
        });

        const groupsFriendsQuery = await Promise.all(
          groupsWithMessages.map(
            (group) =>
              trx.raw(
                `select * from users where id in (${
                  group.friends.length > 0 ? group.friends : -1
                })`
              ) as any
          )
        );

        const groupsFriends = groupsFriendsQuery.map(
          ({ rows }) => rows
        ) as User[][];

        const groupsWithFriendsMessages = groupsWithMessages.map(
          (group, index) => ({
            ...group,
            friends: groupsFriends[index].map((friend) => ({
              ...friend,
              password: undefined,
            })),
          })
        );
        return groupsWithFriendsMessages;
      });
      res.status(200).send(groups);
    } catch (err) {
      console.error(err);
      res.status(500).send(err);
    }
  }
);

groups.get(
  "/groups/:id",
  authenticateToken,
  async (req: ApiRequest, res: Response) => {
    try {
      const group: Group = await db.transaction(async (trx) => {
        const groupNoMessage: Omit<Group, "messages"> | undefined =
          await trx<Group>("groups")
            .first()
            .where({ id: parseInt(req.params.id) });

        const messages: Message[] = await trx<Message>("messages")
          .select()
          .where({ groupId: parseInt(req.params.id) });

        return { ...groupNoMessage, messages } as Group;
      });

      res.status(200).send(group);
    } catch (err) {
      console.error(err);
      res.status(500).send(err);
    }
  }
);

groups.post(
  "/groups",
  authenticateToken,
  async (req: ApiRequest, res: Response) => {
    try {
      await db<Group>("groups").insert({
        userId: req.user?.id,
        name: req.body.name,
        friends: req.body.friends,
      });
      res.status(200).send("Success");
    } catch (err) {
      console.error(err);
      res.status(500).send(err);
    }
  }
);

groups.put(
  "/groups/add-user/:groupId",
  authenticateToken,
  async (req: ApiRequest, res: Response) => {
    try {
      let error = false;
      await db.transaction(async (trx) => {
        const group: Group | undefined = await trx<Group>("groups")
          .first()
          .where({ id: parseInt(req.params.groupId) });

        if (!group) {
          console.error(`Group with id ${req.params.groupId} not found`);
          res.status(404).send(`Group with id ${req.params.groupId} not found`);
          error = true;
          return;
        }

        await trx<Group>("groups")
          .where({ id: parseInt(req.params.groupId) })
          .update({ friends: [...group?.friends, ...req.body.ids] });
      });

      if (error) return;
      res.status(200).send("Success");
    } catch (err) {
      console.error(err);
      res.status(500).send(err);
    }
  }
);

groups.put(
  "/groups/remove-user/:groupId",
  authenticateToken,
  async (req: ApiRequest, res: Response) => {
    try {
      let error = false;
      await db.transaction(async (trx) => {
        const group: Group | undefined = await trx<Group>("groups")
          .first()
          .where({ id: parseInt(req.params.groupId) });

        if (!group) {
          console.error(`Group with id ${req.params.groupId} not found`);
          res.status(404).send(`Group with id ${req.params.groupId} not found`);
          error = true;
          return;
        }
        const newFriends = group.friends.filter(
          (id) =>
            !req.body.ids.some(
              (removedId: number) => removedId === (id as unknown as number)
            )
        );

        await trx<Group>("groups")
          .where({ id: parseInt(req.params.groupId) })
          .update({ friends: newFriends });
      });

      if (error) return;
      res.status(200).send("Success");
    } catch (err) {
      console.error(err);
      res.status(500).send(err);
    }
  }
);

groups.delete(
  "/groups/:id",
  authenticateToken,
  async (req: ApiRequest, res: Response) => {
    try {
      await db.transaction(async (trx) => {
        await trx<Message>("messages")
          .delete()
          .where({ groupId: parseInt(req.params.id) });

        await trx<Group>("groups")
          .delete()
          .where({ id: parseInt(req.params.id) });
      });

      res.status(200).send("Success");
    } catch (err) {
      console.error(err);
      res.status(500).send(err);
    }
  }
);

export default groups;
