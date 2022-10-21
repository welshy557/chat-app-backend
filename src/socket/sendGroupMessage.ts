import { Socket } from "socket.io";
import { Message } from "../socketModels";
import db from "../db/db";

export default function sendGroupMessage(socket: Socket) {
  socket.on("sendGroupMessage", async (message: Message, room: string) => {
    await db("messages").insert({
      userId:
        message.userId === 1 ? message.userId : socket.handshake.auth.user.id,
      groupId: message.groupId,
      message: message.message,
    });

    socket.to(room).emit("recieveMessage", "group");
  });
}
