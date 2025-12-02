import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Body() body: any) {
    console.log('=================================');
    console.log('=== PETICIÓN LOGIN RECIBIDA ===');
    console.log('Body recibido:', body);
    console.log('Usuario autenticado:', req.user);
    console.log('=================================');
    return this.authService.login(req.user);
  }
}