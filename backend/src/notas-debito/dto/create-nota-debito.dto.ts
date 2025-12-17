import { IsNumber, IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotaDebitoDto {
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    instalacionCodigo: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    clienteNombre?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDateString()
    fecha?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    valor?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    disponible?: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    concepto: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    observacion?: string;

    @IsOptional()
    empresaId?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    usuario?: string;
}
