import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PrismaService } from '../../prisma/prisma.service.js';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service.js';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Mock global de bcrypt pour ESM
vi.mock('bcrypt', () => ({
    genSalt: vi.fn(),
    hash: vi.fn(),
    compare: vi.fn(),
}));

describe('UsersService', () => {
    let service: UsersService;
    let prisma: PrismaService;

    const mockPrismaService = {
        user: {
            create: vi.fn(),
            findMany: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
    };

    const mockUser = {
        id: 'uuid-1234',
        email: 'test@test.com',
        password: 'hashedPassword',
        firstname: 'John',
        lastname: 'Doe',
        role: Role.USER,
        enabled: true,
        birthdate: new Date('1990-01-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [UsersService, { provide: PrismaService, useValue: mockPrismaService }],
        }).compile();

        service = module.get<UsersService>(UsersService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('doit être défini', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('doit hasher le mot de passe, créer un utilisateur et retourner le résultat sans le mot de passe', async () => {
            const dto = {
                email: 'test@test.com',
                password: 'rawPassword',
                firstname: 'John',
                lastname: 'Doe',
                role: Role.USER,
                birthdate: new Date('1990-01-01'),
            };

            vi.mocked(bcrypt.genSalt).mockResolvedValue('salt' as never);
            vi.mocked(bcrypt.hash).mockResolvedValue('hashedPassword' as never);
            mockPrismaService.user.create.mockResolvedValue(mockUser);

            const result = await service.create(dto);

            expect(bcrypt.hash).toHaveBeenCalledWith('rawPassword', 'salt');
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    firstname: 'John',
                    lastname: 'Doe',
                    email: 'test@test.com',
                    password: 'hashedPassword',
                    birthdate: dto.birthdate,
                    enabled: true,
                    role: Role.USER,
                    address: undefined,
                },
                include: { address: true },
            });
            expect(result).not.toHaveProperty('password');
            expect(result.email).toBe('test@test.com');
        });
    });

    describe('findAll', () => {
        it("doit retourner une liste d'utilisateurs sans les mots de passe", async () => {
            mockPrismaService.user.findMany.mockResolvedValue([mockUser, { ...mockUser, id: 'uuid-5678' }]);

            const result = await service.findAll();

            expect(prisma.user.findMany).toHaveBeenCalled();
            expect(result).toHaveLength(2);
            expect(result[0]).not.toHaveProperty('password');
        });
    });

    describe('findOne', () => {
        it("doit retourner l'utilisateur sans son mot de passe s'il existe", async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

            const result = await service.findOne('uuid-1234');

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: 'uuid-1234' },
                include: { address: true },
            });
            expect(result).not.toHaveProperty('password');
            expect(result.id).toBe('uuid-1234');
        });

        it("doit lever une NotFoundException si l'utilisateur n'existe pas", async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);

            await expect(service.findOne('inconnu')).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it("doit mettre à jour l'utilisateur avec la syntaxe relationnelle d'adresse", async () => {
            const updateDto: any = { firstname: 'Jane', address: { city: 'Toulouse' } };
            const updatedUser = { ...mockUser, firstname: 'Jane' };

            mockPrismaService.user.update.mockResolvedValue(updatedUser);

            const result = await service.update('uuid-1234', updateDto);

            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 'uuid-1234' },
                data: {
                    firstname: 'Jane',
                    address: { update: { city: 'Toulouse' } },
                },
                include: { address: true },
            });
            expect(result).toEqual(updatedUser);
        });
    });

    describe('remove', () => {
        it("doit appeler findOne puis supprimer l'utilisateur", async () => {
            // On mock findUnique pour que le findOne interne du service réussisse
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            mockPrismaService.user.delete.mockResolvedValue(mockUser);

            await service.remove('uuid-1234');

            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'uuid-1234' }, include: { address: true } });
            expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'uuid-1234' } });
        });
    });

    describe('updatePassword', () => {
        const passwordDto = { currentPassword: 'old', newPassword: 'new' };

        it("doit lever une NotFoundException si l'utilisateur est introuvable", async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);

            await expect(service.updatePassword('inconnu', passwordDto)).rejects.toThrow(NotFoundException);
        });

        it("doit lever une UnauthorizedException si l'ancien mot de passe est incorrect", async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

            await expect(service.updatePassword('uuid-1234', passwordDto)).rejects.toThrow(UnauthorizedException);
        });

        it("doit hasher le nouveau mot de passe et l'enregistrer", async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
            vi.mocked(bcrypt.genSalt).mockResolvedValue('salt' as never);
            vi.mocked(bcrypt.hash).mockResolvedValue('newHashed' as never);

            const result = await service.updatePassword('uuid-1234', passwordDto);

            expect(bcrypt.hash).toHaveBeenCalledWith('new', 'salt');
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 'uuid-1234' },
                data: { password: 'newHashed' },
            });
            expect(result).toEqual({ message: 'Mot de passe mis à jour avec succès' });
        });
    });
});
