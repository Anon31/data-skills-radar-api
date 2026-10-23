import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
    @ApiProperty({ example: 'admin123!' })
    @IsString()
    @IsNotEmpty({ message: "L'ancien mot de passe est requis" })
    currentPassword: string;

    @ApiProperty({ example: 'NouveauMotDePasse123!' })
    @IsString()
    @IsNotEmpty({ message: 'Le nouveau mot de passe est requis' })
    @MinLength(8, { message: 'Le nouveau mot de passe doit faire au moins 8 caractères' })
    newPassword: string;
}
