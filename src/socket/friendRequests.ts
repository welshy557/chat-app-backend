import { Socket } from "socket.io";
import db from "../db/db";
import { User } from "../dbModels";

export default function friendRequests(socket: Socket) {
  socket.on("sentFriendRequest", async (_, email: string) => {
    const requesteeUserId: number | undefined = // User being added
      (await db<User>("users").first().where({ email }))?.id;

    if (requesteeUserId) {
      socket.to(requesteeUserId.toString()).emit("recievedFriendRequest");
    }
  });

  socket.on("refetchFriends", async (_, friendId: number) => {
    socket.to(friendId.toString()).emit("refetchFriends");
  });
}
