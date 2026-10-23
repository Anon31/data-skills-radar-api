import { IsEmail, IsNotEmpty, IsString, MinLength, ValidateNested, IsDate, IsEnum, IsOptional } from 'class-validator';
import { CreateAddressDto } from '../../../shared/dto/create-address.dto.js';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Role } from '@prisma/client';

export class CreateUserDto {
    @ApiProperty({ example: 'Thomas' })
    @IsString()
    @IsNotEmpty({ message: 'Le prénom est obligatoire' })
    firstname: string;

    @ApiProperty({ example: 'Noël' })
    @IsString()
    @IsNotEmpty({ message: 'Le nom est obligatoire' })
    lastname: string;

    @ApiProperty({ example: 'thomas.noel@dataskillsradar.com' })
    @IsEmail({}, { message: "Format d'email invalide" })
    @IsNotEmpty({ message: "L'email est obligatoire" })
    email: string;

    @ApiProperty({ example: 'admin123!' })
    @IsString()
    @IsNotEmpty({ message: 'Le mot de passe est obligatoire' })
    @MinLength(8, { message: 'Le mot de passe doit faire au moins 8 caractères' })
    password: string;

    @ApiPropertyOptional({ example: '+33600000001' })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiProperty({ example: '1979-02-15T00:00:00.000Z' })
    @IsDate({ message: 'Format de date de naissance invalide' })
    @Type(() => Date)
    @IsNotEmpty({ message: 'La date de naissance est obligatoire' })
    birthdate: Date;

    @ApiProperty({ enum: Role, example: Role.ADMIN })
    @IsEnum(Role, { message: 'Le rôle doit être ADMIN, USER ou VISITOR' })
    @IsNotEmpty({ message: 'Le rôle est obligatoire' })
    role: Role;

    @ApiPropertyOptional({ type: CreateAddressDto })
    @ValidateNested()
    @Type(() => CreateAddressDto)
    @IsOptional()
    address?: CreateAddressDto;
}
