import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class GenerarPrefacturaDto {
    @IsInt()
    @Min(1)
    @Max(12)
    @IsNotEmpty()
    mes: number;

    @IsInt()
    @IsNotEmpty()
    year: number;
}
