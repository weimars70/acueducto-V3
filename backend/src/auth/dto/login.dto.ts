import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';

export class LoginDto {
    @IsEmail()
    email: string;

    @IsNotEmpty()
    password: string;

    @IsNumber()
    empresaId: number;
}
