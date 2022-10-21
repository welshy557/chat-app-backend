import { Socket } from "socket.io";

export default function refetchGroups(socket: Socket) {
  socket.on(
    "refetchGroups",
    async (groupId: number | undefined, ids: number[]) => {
      ids.forEach((id) => {
        socket.to(id.toString()).emit("refetchGroups", groupId);
      });
    }
  );
}
