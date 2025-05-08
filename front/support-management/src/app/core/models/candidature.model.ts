export enum CandidatureStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    EXPIRED = 'EXPIRED'
}

export interface Candidature {
    id?: number;
    motivationLetter: string;
    cvUrl?: string;
    status: CandidatureStatus;
    student?: any; // User object
    createdAt?: Date;
    updatedAt?: Date;
    userId?: number;
    fileUrl?: string;
    applicationDate: Date;
    expirationDate?: Date;
    internship?: any; // Internship object (at least { idInternship })
} 