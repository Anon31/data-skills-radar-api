import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        const user = await this.usersService.findByEmail(email);

        // Vérification de l'existence, de l'activation et du mot de passe
        if (!user || !user.enabled || !(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException('Identifiants incorrects ou compte désactivé');
        }

        // Création du Payload JWT (adapté au nouveau schéma sans siteId)
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            firstname: user.firstname,
            lastname: user.lastname,
        };

        // Réponse formatée
        return {
            access_token: await this.jwtService.signAsync(payload),
            message: 'Connexion réussie 🎯',
            user: {
                id: user.id,
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname,
                role: user.role,
            },
        };
    }
}