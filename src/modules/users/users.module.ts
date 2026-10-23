import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { Module } from '@nestjs/common';

@Module({
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {}
