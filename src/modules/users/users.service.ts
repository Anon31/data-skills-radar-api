import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UpdatePasswordDto } from './dto/update-password.dto.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    async create(dto: CreateUserDto) {
        const { email, password, address, birthdate, role, ...rest } = dto;
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await this.prisma.user.create({
            data: {
                ...rest,
                email,
                password: hashedPassword,
                birthdate: new Date(birthdate),
                enabled: true,
                role: role,
                address: address ? { create: { ...address } } : undefined,
            },
            include: { address: true },
        });

        const { password: _, ...result } = newUser;
        return result;
    }

    async findAll() {
        const users = await this.prisma.user.findMany({
            include: { address: true },
            orderBy: { createdAt: 'desc' },
        });
        return users.map(({ password: _, ...user }) => user);
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { address: true },
        });
        if (!user) throw new NotFoundException(`Utilisateur #${id} introuvable`);

        const { password: _, ...result } = user;
        return result;
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        // Extraction de l'adresse et de la date de naissance du reste des données utilisateur
        const { address, birthdate, ...userData } = updateUserDto;

        // Préparation de l'objet principal
        const dataToUpdate: any = { ...userData };

        if (birthdate) {
            dataToUpdate.birthdate = new Date(birthdate);
        }

        // Si une adresse est présente, on utilise upsert (si complète) ou update (si partielle)
        if (address) {
            if (address.number && address.street && address.city && address.postalCode && address.country) {
                dataToUpdate.address = {
                    upsert: {
                        create: {
                            number: address.number,
                            street: address.street,
                            city: address.city,
                            postalCode: address.postalCode,
                            country: address.country,
                        },
                        update: address,
                    },
                };
            } else {
                dataToUpdate.address = {
                    update: address,
                };
            }
        }

        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: dataToUpdate,
            include: { address: true },
        });

        const { password: _, ...result } = updatedUser;
        return result;
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.user.delete({ where: { id } });
    }

    async updatePassword(userId: string, dto: UpdatePasswordDto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('Utilisateur introuvable');

        const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException("L'ancien mot de passe est incorrect.");
        }

        const salt = await bcrypt.genSalt();
        const hashedNewPassword = await bcrypt.hash(dto.newPassword, salt);

        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword },
        });

        return { message: 'Mot de passe mis à jour avec succès' };
    }
}
