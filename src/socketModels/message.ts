import { User } from "../dbModels";

export interface Message {
  friendId: number;
  userId: number;
  groupId: number;
  message: string;
}
