import { Socket } from "socket.io";
import { Message } from "../socketModels";
import db from "../db/db";
import bcrypt from "bcrypt";

export default function sendMessage(socket: Socket) {
  socket.on("sendMessage", async (message: Message, room: string) => {
    socket.to(room).emit("recieveMessage", {
      userId: socket.handshake.auth.user.id,
      friendId: message.friendId,
      message: message.message,
    });
    await db("messages").insert({
      userId: socket.handshake.auth.user.id,
      friendId: message.friendId,
      message: message.message,
    });
  });
}
