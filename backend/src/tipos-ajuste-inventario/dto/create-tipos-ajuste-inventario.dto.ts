import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateTiposAjusteInventarioDto {
    @IsNotEmpty({ message: 'El nombre es requerido' })
    @IsString()
    nombre: string;

    @IsNotEmpty({ message: 'suma_unidades es requerido' })
    @IsBoolean()
    sumaUnidades: boolean;

    @IsNotEmpty({ message: 'resta_unidades es requerido' })
    @IsBoolean()
    restaUnidades: boolean;

    @IsNotEmpty({ message: 'valor_unidades es requerido' })
    @IsBoolean()
    valorUnidades: boolean;

    @IsOptional()
    @IsBoolean()
    activo?: boolean;
}
