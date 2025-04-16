export interface User {
  id_User?: number;  // Primary ID field from backend
  login: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  keycloakId?: string;
  num_tel?: string;
  imageUrl?: string;
  isTicketManager?: boolean;  // Added for ticket manager functionality
} 