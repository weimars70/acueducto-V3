import { IsNotEmpty, IsNumber, IsString, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class ItemAjusteDto {
    @IsNotEmpty({ message: 'El ID del item es requerido' })
    @IsNumber()
    idItem: number;

    @IsNotEmpty({ message: 'La cantidad es requerida' })
    @IsNumber()
    cantidad: number;

    @IsString()
    motivo?: string;
}

export class CreateAjusteMultipleDto {
    @IsNotEmpty({ message: 'El código del tipo de ajuste es requerido' })
    @IsNumber()
    codigoTipoAjuste: number;

    @IsNotEmpty({ message: 'Debe incluir al menos un item' })
    @IsArray()
    @ArrayMinSize(1, { message: 'Debe incluir al menos un item' })
    @ValidateNested({ each: true })
    @Type(() => ItemAjusteDto)
    items: ItemAjusteDto[];

    @IsString()
    motivoGeneral?: string;
}
