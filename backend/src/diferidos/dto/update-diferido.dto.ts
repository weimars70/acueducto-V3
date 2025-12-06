import { PartialType } from '@nestjs/mapped-types';
import { CreateDiferidoDto } from './create-diferido.dto';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateDiferidoDto extends PartialType(CreateDiferidoDto) {
    @IsOptional()
    @IsString()
    estado?: string;

    @IsOptional()
    @IsNumber()
    cuotasPendientes?: number;
}
