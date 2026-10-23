import { Role } from '@prisma/client';

/**
 * Interface représentant les informations de l'utilisateur actuel, généralement extraites du JWT.
 */
export interface ICurrentUser {
    userId: string; // Identifiant de l'utilisateur (UUID - Standard JWT)
    email: string;
    firstname: string;
    lastname: string;
    role: Role;
    iat?: number;
    exp?: number;
}
