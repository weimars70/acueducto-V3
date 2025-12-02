import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    console.log('=================================');
    console.log('=== LOCAL STRATEGY VALIDATE ===');
    console.log('Email:', email);
    console.log('Password recibido:', password ? 'Sí' : 'No');
    console.log('=================================');

    const user = await this.authService.validateUser(email, password);

    if (!user) {
      console.log('✗ Usuario NO validado - lanzando UnauthorizedException');
      throw new UnauthorizedException('Credenciales inválidas');
    }

    console.log('✓ Usuario validado correctamente');
    return user;
  }
}