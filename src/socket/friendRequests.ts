import { Socket } from "socket.io";
import db from "../db/db";
import { User } from "../dbModels";

interface RefetchFriendsRequest {
  friend: User;
  type: "accept" | "deny" | "removed";
}

export default function friendRequests(socket: Socket) {
  socket.on("sentFriendRequest", async (email: string) => {
    const requesteeUser: User | undefined = // User being added
      await db<User>("users").first().where({ email });

    if (requesteeUser) {
      socket
        .to(requesteeUser.id.toString())
        .emit("recievedFriendRequest", requesteeUser);
    }
  });

  socket.on(
    "refetchFriends",
    async (req: RefetchFriendsRequest, friendId: number) => {
      socket.to(friendId.toString()).emit("refetchFriends", req);
    }
  );
}
