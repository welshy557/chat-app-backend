import { Socket } from "socket.io";

export default function joinGroupRoom(socket: Socket) {
  socket.on("joinGroupRoom", async (room: string) => {
    socket.join(`group${room}`);

    console.log(socket.rooms);
  });
}
