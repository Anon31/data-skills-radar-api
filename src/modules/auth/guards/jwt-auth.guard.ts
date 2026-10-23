import { IS_PUBLIC_KEY } from '../../../core/decorators/public.decorator.js';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private readonly reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        // On récupère la métadonnée 'isPublic' sur la méthode ou le contrôleur
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);

        // Si le décorateur @Public() est présent, on laisse passer sans vérifier le token
        if (isPublic) {
            return true;
        }

        // Sinon, on délègue la vérification du token à la classe parente AuthGuard('jwt')
        return super.canActivate(context);
    }
}
