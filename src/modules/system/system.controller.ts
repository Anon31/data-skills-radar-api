import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { Public } from '../../core/decorators/public.decorator.js';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SystemService } from './system.service.js';

@ApiTags('Système & Métadonnées')
@Controller('system')
export class SystemController {
    constructor(private readonly systemService: SystemService) {}

    @Public()
    @Get('status')
    @ApiOperation({ summary: 'Récupérer le statut global du système et de sa sécurité' })
    @HttpCode(HttpStatus.OK)
    getSystemStatus() {
        return this.systemService.getSystemStatus();
    }

    @Public()
    @Get('reference-data')
    @ApiOperation({ summary: 'Récupérer tous les dictionnaires de référence (enums) pour le frontend' })
    @HttpCode(HttpStatus.OK)
    getReferenceData() {
        return this.systemService.getReferenceData();
    }
}
