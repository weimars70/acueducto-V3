import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetCompaniesDto } from './dto/get-companies.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('companies')
  async getCompanies(@Body() getCompaniesDto: GetCompaniesDto) {
    console.log('=== GET COMPANIES REQUEST ===');
    console.log('Email:', getCompaniesDto.email);
    const companies = await this.authService.getCompaniesByEmail(getCompaniesDto.email);
    console.log('Companies found:', companies.length);
    return companies;
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    console.log('=== LOGIN REQUEST ===');
    console.log('Email:', loginDto.email);
    console.log('EmpresaId:', loginDto.empresaId);

    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
      loginDto.empresaId
    );

    if (!user) {
      return { success: false, message: 'Credenciales inválidas' };
    }

    return this.authService.login(user);
  }
}