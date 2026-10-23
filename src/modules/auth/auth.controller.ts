import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Request } from '@nestjs/common';
import { ICurrentUser } from '../../shared/interfaces/current-user.interface.js';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../core/decorators/public.decorator.js';
import { UsersService } from '../users/users.service.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) {}

    @Public()
    @Post('login')
    @ApiOperation({ summary: "Connexion de l'utilisateur" })
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Déconnexion de l'utilisateur" })
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    logout() {
        return { message: 'Déconnexion réussie' };
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: "Récupérer le profil de l'utilisateur connecté" })
    @ApiBearerAuth()
    getProfile(@Request() req: { user: ICurrentUser }) {
        return this.usersService.findOne(req.user.userId);
    }
}
