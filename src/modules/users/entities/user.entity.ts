import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UserEntity {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    id: string;

    @ApiProperty({ example: 'John' })
    firstname: string;

    @ApiProperty({ example: 'Doe' })
    lastname: string;

    @ApiProperty({ example: 'john.doe@dataskillsradar.com' })
    email: string;

    @ApiPropertyOptional({ example: '+33600000001' })
    phone?: string;

    @ApiProperty({ example: '1979-02-15T00:00:00.000Z' })
    birthdate: Date;

    @ApiProperty({ example: true })
    enabled: boolean;

    @ApiProperty({ enum: Role, example: Role.ADMIN })
    role: Role;

    @ApiProperty({ example: '2026-10-22T10:00:00.000Z' })
    createdAt: Date;

    @ApiProperty({ example: '2026-10-22T10:00:00.000Z' })
    updatedAt: Date;

    constructor(partial: Partial<UserEntity>) {
        Object.assign(this, partial);
    }
}
