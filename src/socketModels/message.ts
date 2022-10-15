import { User } from "../dbModels";

export interface Message {
  friendId: number;
  userId: number;
  message: string;
}
