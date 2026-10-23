import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Role } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto.js';

describe('UsersController', () => {
    let controller: UsersController;
    let service: UsersService;

    const mockUsersService = {
        create: vi.fn(),
        findAll: vi.fn(),
        findOne: vi.fn(),
        update: vi.fn(),
        remove: vi.fn(),
        updatePassword: vi.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [{ provide: UsersService, useValue: mockUsersService }],
        }).compile();

        controller = module.get<UsersController>(UsersController);
        service = module.get<UsersService>(UsersService);
    });

    it('doit être défini', () => {
        expect(controller).toBeDefined();
    });

    it('create: doit appeler usersService.create avec le DTO', async () => {
        const createUserDto = {
            email: 'new@test.com',
            password: 'pwd',
            firstname: 'John',
            lastname: 'Doe',
            role: Role.USER,
            birthdate: new Date('1995-05-15T00:00:00.000Z'),
        } as CreateUserDto;

        const expectedUser = { id: 'uuid-1', ...createUserDto };

        mockUsersService.create.mockResolvedValue(expectedUser);

        const result = await controller.create(createUserDto);

        expect(service.create).toHaveBeenCalledWith(createUserDto);
        expect(result).toEqual(expectedUser);
    });

    it('findAll: doit appeler usersService.findAll', async () => {
        const expectedUsers = [{ id: 'uuid-1', email: 'test@test.com' }];

        mockUsersService.findAll.mockResolvedValue(expectedUsers);

        const result = await controller.findAll();

        expect(service.findAll).toHaveBeenCalled();
        expect(result).toEqual(expectedUsers);
    });

    it("findOne: doit appeler usersService.findOne avec l'ID", async () => {
        const id = 'uuid-1234';
        const expectedUser = { id, email: 'test@test.com' };

        mockUsersService.findOne.mockResolvedValue(expectedUser);

        const result = await controller.findOne(id);

        expect(service.findOne).toHaveBeenCalledWith(id);
        expect(result).toEqual(expectedUser);
    });

    it("update: doit appeler usersService.update avec l'ID et le DTO", async () => {
        const id = 'uuid-1234';
        const updateUserDto = { firstname: 'Jane' };
        const expectedUser = { id, firstname: 'Jane' };

        mockUsersService.update.mockResolvedValue(expectedUser);

        const result = await controller.update(id, updateUserDto);

        expect(service.update).toHaveBeenCalledWith(id, updateUserDto);
        expect(result).toEqual(expectedUser);
    });

    it("remove: doit appeler usersService.remove avec l'ID", async () => {
        const id = 'uuid-1234';
        const expectedResult = { message: 'Utilisateur supprimé' };

        mockUsersService.remove.mockResolvedValue(expectedResult);

        const result = await controller.remove(id);

        expect(service.remove).toHaveBeenCalledWith(id);
        expect(result).toEqual(expectedResult);
    });

    it('updatePassword: doit extraire le userId et appeler usersService.updatePassword', async () => {
        const req = { user: { userId: 'uuid-1234', email: 'test@test.com', role: Role.USER } };
        const updatePasswordDto = { oldPassword: 'old', newPassword: 'new' };
        const expectedResult = { message: 'Mot de passe mis à jour' };

        mockUsersService.updatePassword.mockResolvedValue(expectedResult);

        // @ts-ignore : Cast forcé pour simuler l'objet Request Express
        const result = await controller.updatePassword(req, updatePasswordDto);

        expect(service.updatePassword).toHaveBeenCalledWith('uuid-1234', updatePasswordDto);
        expect(result).toEqual(expectedResult);
    });
});
