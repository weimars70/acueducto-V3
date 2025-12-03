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
    try {
      const user = await this.usersService.findByEmail(email);
      console.log('Usuario obtenido:', {
        id: user.id,
        email: user.email,
        name: user.name,
        passwordHash: user.passwordHash ? `${user.passwordHash.substring(0, 20)}...` : 'NO HASH'
      });


      // DEBUG: Verificar valores exactos
      console.log('=== DEBUG PASSWORD VALIDATION ===');
      console.log('password (entrada):', JSON.stringify(password));
      console.log('password length:', password.length);
      console.log('password type:', typeof password);
      console.log('user.passwordHash:', JSON.stringify(user.passwordHash));
      console.log('user.passwordHash length:', user.passwordHash ? user.passwordHash.length : 0);
      console.log('user.passwordHash type:', typeof user.passwordHash);

      
      // Limpiar espacios en blanco
      const cleanPassword = password.trim();
      const cleanHash = user.passwordHash.trim();

      console.log('cleanPassword:', JSON.stringify(cleanPassword));
      console.log('cleanHash:', JSON.stringify(cleanHash));
      console.log('=================================');

      // Comparar contraseña en texto plano con el hash bcrypt de la BD
      const isPasswordValid = await bcrypt.compare(cleanPassword, cleanHash);
      console.log('isPasswordValid:', isPasswordValid);
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