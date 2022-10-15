import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Socket } from "socket.io";

dotenv.config();

const authenticateToken = (socket: Socket, next: any) => {
  const token = socket.handshake.auth.token.split(" ")[1] as string | undefined;
  if (token == null) {
    return next(new Error("Unauthorized"));
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY as string, (err, user) => {
    if (err) {
      return next(Error("Unauthorized"));
    }
    socket.handshake.auth.user = user;
    next();
  });
};

export default authenticateToken;
