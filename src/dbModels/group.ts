import { Message } from "./message";

export interface Group {
  id: number;
  name: string;
  userId: number;
  friends: number[];
  messages: Message[];
  created_at: string;
  updated_at: string;
}
