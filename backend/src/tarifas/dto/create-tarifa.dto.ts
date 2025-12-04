import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateTarifaDto {
    @ApiProperty()
    @IsNumber()
    basico: number;

    @ApiProperty()
    @IsNumber()
    complementario: number;

    @ApiProperty()
    @IsDateString()
    desde: string;

    @ApiProperty()
    @IsDateString()
    hasta: string;

    @ApiProperty()
    @IsNumber()
    empresa_id: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    usuario?: string;
}
