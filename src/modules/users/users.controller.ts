import { Controller, Get, Post, Body, Request, Param, Delete, Patch, UseGuards } from '@nestjs/common';
import { ICurrentUser } from '../../shared/interfaces/current-user.interface.js';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../core/decorators/roles.decorator.js';
import { UpdatePasswordDto } from './dto/update-password.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../core/guards/roles.guard.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UsersService } from './users.service.js';
import { Role } from '@prisma/client';

@ApiTags('Utilisateurs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Créer un nouvel utilisateur' })
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    @Roles(Role.ADMIN, Role.USER)
    @ApiOperation({ summary: 'Récupérer la liste de tous les utilisateurs' })
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.USER)
    @ApiOperation({ summary: "Récupérer le profil d'un utilisateur par son ID" })
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: "Mettre à jour le profil d'un utilisateur" })
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Supprimer définitivement un compte utilisateur' })
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }

    @Patch('me/password')
    @ApiOperation({ summary: "Mettre à jour le mot de passe de l'utilisateur connecté" })
    updatePassword(@Request() req: { user: ICurrentUser }, @Body() updatePasswordDto: UpdatePasswordDto) {
        return this.usersService.updatePassword(req.user.userId, updatePasswordDto);
    }
}
