import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateTipoImpuestoDto {
    @ApiProperty()
    @IsNumber()
    codigo: number;

    @ApiProperty()
    @IsString()
    nombre: string;

    @ApiProperty()
    @IsString()
    code: string;

    @ApiProperty()
    @IsNumber()
    empresa_id: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    usuario?: string;
}
