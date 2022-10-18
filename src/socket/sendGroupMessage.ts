import { Socket } from "socket.io";
import { Message } from "../socketModels";
import db from "../db/db";

export default function sendGroupMessage(socket: Socket) {
  socket.on("sendGroupMessage", async (message: Message, room: string) => {
    socket.to(room).emit("recieveMessage", {
      userId: socket.handshake.auth.user.id,
      groupId: message.groupId,
      message: message.message,
    });
    await db("messages").insert({
      userId: socket.handshake.auth.user.id,
      groupId: message.groupId,
      message: message.message,
    });
  });
}
