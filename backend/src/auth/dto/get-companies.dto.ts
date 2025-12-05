import { IsEmail } from 'class-validator';

export class GetCompaniesDto {
    @IsEmail()
    email: string;
}
