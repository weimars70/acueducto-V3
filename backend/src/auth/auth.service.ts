import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    console.log('=================================');
    console.log('=== VALIDANDO USUARIO ===');
    console.log('Email:', email);
    console.log('Password (longitud):', password?.length);
    console.log('=================================');

    try {
      const user = await this.usersService.findByEmail(email);
      console.log('Usuario obtenido:', {
        id: user.id,
        email: user.email,
        name: user.name,
        passwordHash: user.passwordHash ? `${user.passwordHash.substring(0, 20)}...` : 'NO HASH'
      });

      console.log('=================================');
      console.log('=== COMPARACIÓN DE CONTRASEÑAS ===');
      console.log('Password recibida del frontend (texto plano):', password);
      console.log('Longitud password recibida:', password.length);
      console.log('Password hash almacenado en BD:', user.passwordHash);
      console.log('Longitud del hash BD:', user.passwordHash?.length);
      console.log('Hash es bcrypt? (empieza con $2):', user.passwordHash?.startsWith('$2'));
      console.log('=================================');

      // Comparar contraseña en texto plano con el hash bcrypt de la BD
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      console.log('Resultado bcrypt.compare():', isPasswordValid);
      console.log('=================================');

      if (isPasswordValid) {
        console.log('✓ La contraseña coincide - autenticación exitosa');
        const { passwordHash, ...result } = user;
        return result;
      } else {
        console.log('✗ La contraseña NO coincide');
        return null;
      }
    } catch (error) {
      console.error('✗ Error al validar usuario:', error.message);
      console.error('Stack:', error.stack);
      return null;
    }
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.email,
        email: user.email,
        role: user.role || 'user',
        name: user.name || 'Usuario',
      },
    };
  }
}