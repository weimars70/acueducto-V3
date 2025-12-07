import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTipoPersonaDto {
    @IsNotEmpty()
    @IsString()
    nombre: string;
}
