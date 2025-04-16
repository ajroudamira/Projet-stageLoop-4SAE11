import { User } from './user.model';
import { Ticket } from './ticket.model';

export interface Comment {
  id?: number;
  content: any;
  internal: boolean;
  ticket: Ticket;
  author: User;
  user?: User;
  createdAt?: Date;
  updatedAt?: Date;
} 