import { Message } from "./message";
import { User } from "./user";

export interface Group {
  id: number;
  name: string;
  userId: number;
  friends: Omit<User, "password">[];
  messages: Message[];
  created_at: string;
  updated_at: string;
}
