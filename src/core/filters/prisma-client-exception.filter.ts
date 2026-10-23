import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
    catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        switch (exception.code) {
            case 'P2000': {
                const status = HttpStatus.BAD_REQUEST;
                response.status(status).json({
                    statusCode: status,
                    message: `La valeur fournie pour l'un des champs est trop longue par rapport à ce qui est autorisé en base de données.`,
                    error: 'Bad Request',
                });
                break;
            }
            case 'P2002': {
                const status = HttpStatus.CONFLICT;
                response.status(status).json({
                    statusCode: status,
                    message: `Un conflit est survenu : Un enregistrement avec ce champ unique (ex: email) existe déjà.`,
                    error: 'Conflict',
                });
                break;
            }
            case 'P2003': {
                const status = HttpStatus.BAD_REQUEST;
                response.status(status).json({
                    statusCode: status,
                    message: `Opération impossible : Cet enregistrement est lié à d'autres données dans le système.`,
                    error: 'Bad Request',
                });
                break;
            }
            case 'P2025': {
                const status = HttpStatus.NOT_FOUND;
                response.status(status).json({
                    statusCode: status,
                    message: `Ressource introuvable ou déjà supprimée.`,
                    error: 'Not Found',
                });
                break;
            }
            default:
                super.catch(exception, host);
                break;
        }
    }
}
