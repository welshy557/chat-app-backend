export interface Message {
  id: number;
  userId: number;
  friendId?: number;
  groupId?: number;
  message: string;
  updatedAt: string;
  createdAt: string;
}
