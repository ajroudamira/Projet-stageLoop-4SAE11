import { User } from './user.model';
import { Ticket } from './ticket.model';

export interface Attachment {
  id?: number;
  fileName: string;
  fileType: string;
  filePath: string;
  fileSize: number;
  ticket: Ticket;
  uploadedBy: User;
  uploadedAt?: Date;
} 