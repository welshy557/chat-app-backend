import { Knex } from "knex";
import { Friend, User } from "../../dbModels";

export const getUserFriendsCorrelations = async (
  user: Omit<User, "password">,
  trx: Knex.Transaction
): Promise<Friend[]> => {
  return await trx("friends").select().where({ userId: user.id });
};

export const getUsersFriends = async (
  user: Omit<User, "password">,
  trx: Knex.Transaction
): Promise<User[]> => {
  const usersFriendCorrelations = await getUserFriendsCorrelations(user, trx);
  const usersFriends: User[] = await Promise.all(
    usersFriendCorrelations.map((friendCorrelation) => {
      return trx("users")
        .select("id", "firstName", "lastName")
        .where({ id: friendCorrelation.friendId })
        .first();
    })
  );
  return usersFriends;
};
