import { CreateAddressDto } from '../../../shared/dto/create-address.dto.js';
import { ValidateNested, IsOptional } from 'class-validator';
import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto.js';
import { Type } from 'class-transformer';

class UpdateAddressDto extends PartialType(CreateAddressDto) {}

// On omet 'address' du CreateUserDto original pour le redéfinir sans conflit de type
export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['address'] as const)) {
    @IsOptional()
    @ValidateNested()
    @Type(() => UpdateAddressDto)
    address?: UpdateAddressDto;
}
