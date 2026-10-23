import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UsersService } from '../users/users.service.js';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: AuthService;
    let usersService: UsersService;

    // Création des mocks pour les services injectés
    const mockAuthService = {
        login: vi.fn(),
    };

    const mockUsersService = {
        findOne: vi.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                { provide: AuthService, useValue: mockAuthService },
                { provide: UsersService, useValue: mockUsersService },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
        usersService = module.get<UsersService>(UsersService);
    });

    it('doit être défini', () => {
        expect(controller).toBeDefined();
    });

    it('login: doit appeler authService.login avec le DTO et retourner le token', async () => {
        const loginDto = { email: 'user@dataskillsradar.com', password: 'user123!' };
        const expectedToken = { access_token: 'mock_jwt_token' };

        mockAuthService.login.mockResolvedValue(expectedToken);

        const result = await controller.login(loginDto);

        expect(authService.login).toHaveBeenCalledWith(loginDto);
        expect(result).toEqual(expectedToken);
    });

    it('logout: doit retourner le message de confirmation', () => {
        const result = controller.logout();
        expect(result).toEqual({ message: 'Déconnexion réussie' });
    });

    it('getProfile: doit extraire le userId de la requête et appeler usersService.findOne', async () => {
        const req = { user: { userId: 'uuid-1234', email: 'user@test.com', role: 'USER' } };
        const expectedUser = { id: 'uuid-1234', email: 'user@test.com' };

        mockUsersService.findOne.mockResolvedValue(expectedUser);

        // @ts-ignore : Cast forcé pour simuler l'objet Request Express avec l'injection ICurrentUser
        const result = await controller.getProfile(req);

        expect(usersService.findOne).toHaveBeenCalledWith('uuid-1234');
        expect(result).toEqual(expectedUser);
    });
});
