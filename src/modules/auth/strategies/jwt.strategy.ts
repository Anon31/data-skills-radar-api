import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
        const secret = configService.get<string>('JWT_SECRET');

        if (!secret) {
            throw new Error("La variable d'environnement JWT_SECRET n'est pas définie.");
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    validate(payload: any) {
        return {
            userId: payload.sub,
            email: payload.email,
            role: payload.role,
            firstname: payload.firstname,
            lastname: payload.lastname,
        };
    }
}
