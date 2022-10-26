import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { User } from "./dbModels";
import { Request } from "express";
import sendFriendMessage from "./socket/sendFriendMessage";
import friends from "./routes/friends";
import user from "./routes/users/users-controller";
import message from "./routes/messages";
import auth from "./routes/auth";
import authenticateToken from "./socketMiddleware/auth-token";
import friendRequests from "./routes/friendRequests";
import socketFriendRequests from "./socket/friendRequests";
import groups from "./routes/groups";
import sendGroupMessage from "./socket/sendGroupMessage";
import joinGroupRoom from "./socket/joinGroupRoom";
import refetchGroup from "./socket/refetchGroups";

export interface ApiRequest extends Request {
  user?: User;
}

const app = express();

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://main--elaborate-cajeta-7e14e8.netlify.app",
    "https://elaborate-cajeta-7e14e8.netlify.app",
  ],
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(user);
app.use(friends);
app.use(friendRequests);
app.use(message);
app.use(auth);
app.use(groups);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://main--elaborate-cajeta-7e14e8.netlify.app",
      "https://elaborate-cajeta-7e14e8.netlify.app",
    ],
    methods: ["GET", "POST", "DELETE", "PUT"],
  },
});

io.on("connection", (socket) => {
  console.log(`Connected with ID: ${socket.id}`);
  socket.join(socket.handshake.auth.user.id.toString());
  sendFriendMessage(socket);
  sendGroupMessage(socket);
  joinGroupRoom(socket);
  socketFriendRequests(socket);
  refetchGroup(socket);
});

io.use(authenticateToken);

const port = process.env.PORT || 3001;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
