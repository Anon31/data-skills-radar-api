import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SystemController } from './system.controller.js';
import { Test, TestingModule } from '@nestjs/testing';
import { SystemService } from './system.service.js';

describe('SystemController', () => {
    let controller: SystemController;

    const mockSystemService = {
        getSystemStatus: vi.fn(),
        getReferenceData: vi.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [SystemController],
            providers: [{ provide: SystemService, useValue: mockSystemService }],
        }).compile();

        controller = module.get<SystemController>(SystemController);
    });

    it('doit être défini', () => {
        expect(controller).toBeDefined();
    });

    it('getSystemStatus: doit appeler systemService.getSystemStatus et retourner le statut', () => {
        const expectedStatus = {
            environment: 'test',
            vaultSecured: true,
            version: '1.0.0',
            timestamp: new Date().toISOString(),
        };

        mockSystemService.getSystemStatus.mockReturnValue(expectedStatus);

        const result = controller.getSystemStatus();

        expect(mockSystemService.getSystemStatus).toHaveBeenCalled();
        expect(result).toEqual(expectedStatus);
    });

    it('getReferenceData: doit appeler systemService.getReferenceData et retourner les enums', () => {
        const expectedData = {
            roles: { ADMIN: 'ADMIN', USER: 'USER' },
            niveauImpactIA: { FORT: 'FORT' },
        };

        mockSystemService.getReferenceData.mockReturnValue(expectedData);

        const result = controller.getReferenceData();

        expect(mockSystemService.getReferenceData).toHaveBeenCalled();
        expect(result).toEqual(expectedData);
    });
});
