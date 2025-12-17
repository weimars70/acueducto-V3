import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotaDebitoConceptoDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    descripcion: string;

    @ApiProperty({ required: false })
    @IsOptional()
    usuario?: string;

    @IsOptional()
    empresaId?: number;
}
