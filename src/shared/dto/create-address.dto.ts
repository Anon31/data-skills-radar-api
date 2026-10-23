import { IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
    @ApiPropertyOptional({ example: '15' })
    @IsString()
    @IsOptional()
    number?: string;

    @ApiProperty({ example: 'Rue de la République' })
    @IsString()
    @IsNotEmpty({ message: 'La rue est obligatoire' })
    street: string;

    @ApiProperty({ example: 'Puylaurens' })
    @IsString()
    @IsNotEmpty({ message: 'La ville est obligatoire' })
    city: string;

    @ApiProperty({ example: '81700' })
    @IsString()
    @IsNotEmpty({ message: 'Le code postal est obligatoire' })
    postalCode: string;

    @ApiProperty({ example: 'France' })
    @IsString()
    @IsNotEmpty({ message: 'Le pays est obligatoire' })
    country: string;
}
