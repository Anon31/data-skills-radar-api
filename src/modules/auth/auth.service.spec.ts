import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { UsersService } from '../users/users.service.js';
import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service.js';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

// 1. Mock global du module bcrypt (compatible ESM)
vi.mock('bcrypt', () => ({
    compare: vi.fn(),
}));

describe('AuthService', () => {
    let service: AuthService;
    let usersService: UsersService;
    let jwtService: JwtService;

    const mockUsersService = {
        findByEmail: vi.fn(),
    };

    const mockJwtService = {
        signAsync: vi.fn(),
    };

    const mockUser = {
        id: 'uuid-1234',
        email: 'user@dataskillsradar.com',
        password: 'hashedPassword',
        enabled: true,
        firstname: 'Thomas',
        lastname: 'Noël',
        role: 'USER',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AuthService, { provide: UsersService, useValue: mockUsersService }, { provide: JwtService, useValue: mockJwtService }],
        }).compile();

        service = module.get<AuthService>(AuthService);
        usersService = module.get<UsersService>(UsersService);
        jwtService = module.get<JwtService>(JwtService);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('doit être défini', () => {
        expect(service).toBeDefined();
    });

    describe('login', () => {
        const loginDto = { email: 'user@dataskillsradar.com', password: 'user123!' };

        it("doit rejeter si l'utilisateur n'existe pas", async () => {
            mockUsersService.findByEmail.mockResolvedValue(null);

            await expect(service.login(loginDto)).rejects.toThrow(new UnauthorizedException('Identifiants incorrects ou compte désactivé'));
        });

        it('doit rejeter si le compte est désactivé (enabled: false)', async () => {
            mockUsersService.findByEmail.mockResolvedValue({ ...mockUser, enabled: false });

            await expect(service.login(loginDto)).rejects.toThrow(new UnauthorizedException('Identifiants incorrects ou compte désactivé'));
        });

        it('doit rejeter si le mot de passe est incorrect', async () => {
            mockUsersService.findByEmail.mockResolvedValue(mockUser);
            // 2. Utilisation de vi.mocked au lieu de vi.spyOn
            vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

            await expect(service.login(loginDto)).rejects.toThrow(new UnauthorizedException('Identifiants incorrects ou compte désactivé'));
        });

        it('doit retourner un token JWT et le profil si les identifiants sont valides', async () => {
            mockUsersService.findByEmail.mockResolvedValue(mockUser);
            // 2. Utilisation de vi.mocked au lieu de vi.spyOn
            vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
            mockJwtService.signAsync.mockResolvedValue('mock_jwt_token');

            const result = await service.login(loginDto);

            expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
            expect(jwtService.signAsync).toHaveBeenCalledWith({
                sub: mockUser.id,
                email: mockUser.email,
                role: mockUser.role,
                firstname: mockUser.firstname,
                lastname: mockUser.lastname,
            });
            expect(result).toEqual({
                access_token: 'mock_jwt_token',
                message: 'Connexion réussie 🎯',
                user: {
                    id: mockUser.id,
                    email: mockUser.email,
                    firstname: mockUser.firstname,
                    lastname: mockUser.lastname,
                    role: mockUser.role,
                },
            });
        });
    });
});
