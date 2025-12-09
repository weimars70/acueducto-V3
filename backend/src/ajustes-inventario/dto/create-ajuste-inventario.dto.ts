import { IsNotEmpty, IsNumber, IsString, IsIn } from 'class-validator';

export class CreateAjusteInventarioDto {
    @IsNotEmpty({ message: 'El ID del item es requerido' })
    @IsNumber()
    idItem: number;

    @IsNotEmpty({ message: 'El tipo de ajuste es requerido' })
    @IsString()
    @IsIn(['+', '-', 'inicial'], { message: 'El tipo de ajuste debe ser +, - o inicial' })
    tipoAjuste: string;

    @IsNotEmpty({ message: 'La cantidad es requerida' })
    @IsNumber()
    cantidad: number;

    @IsString()
    motivo?: string;
}
