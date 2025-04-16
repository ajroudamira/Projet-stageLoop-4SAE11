import { User } from './user.model';

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum TicketCategory {
  TECHNICAL = 'TECHNICAL',
  ACCOUNT = 'ACCOUNT',
  INTERNSHIP_POSTING = 'INTERNSHIP_POSTING',
  PAYMENT = 'PAYMENT'
}

export interface Ticket {
  id?: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  createdAt?: Date;
  updatedAt?: Date;
  submitter?: User;
  assignedAdmin?: User;
  internshipId?: number;
  
  id_ticket?: number;
  admin?: User;
  student?: User;
  idInternship?: number;
  date_creation?: Date;
  date_update?: Date;
} 