import { User } from './user.model';
import { Ticket } from './ticket.model';

export interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  user: User;
  createdAt: string;
  type: string;
  ticket?: Ticket;
} 