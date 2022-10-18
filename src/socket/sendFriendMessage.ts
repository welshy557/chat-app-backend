import { Socket } from "socket.io";
import { Message } from "../socketModels";
import db from "../db/db";

export default function sendFriendMessage(socket: Socket) {
  socket.on("sendFriendMessage", async (message: Message, room: string) => {
    await db("messages").insert({
      userId: socket.handshake.auth.user.id,
      friendId: message.friendId,
      message: message.message,
    });

    socket.to(room).emit("recieveMessage", {
      userId: socket.handshake.auth.user.id,
      friendId: message.friendId,
      message: message.message,
    });
  });
}
