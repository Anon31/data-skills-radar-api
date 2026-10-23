import { Module } from '@nestjs/common';
import { SystemService } from './system.service.js';
import { SystemController } from './system.controller.js';

@Module({
  controllers: [SystemController],
  providers: [SystemService],
})
export class SystemModule {}
