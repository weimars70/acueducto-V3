import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEmpresa } from '../entities/user-empresa.entity';
import { Empresa } from '../entities/empresa.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(UserEmpresa)
    private userEmpresaRepository: Repository<UserEmpresa>,
    @InjectRepository(Empresa)
    private empresaRepository: Repository<Empresa>,
  ) { }

  async getCompaniesByEmail(email: string) {
    console.log('=== GET COMPANIES BY EMAIL ===');
    console.log('Email recibido:', email);

    try {
      const companies = await this.userEmpresaRepository.find({
        where: { email }
      });

      console.log('Empresas encontradas:', companies.length);
      console.log('Datos:', companies);

      return companies;
    } catch (error) {
      console.error('Error al buscar empresas:', error);
      throw error;
    }
  }

  async validateUser(email: string, password: string, empresaId: number): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(email);

      // Verify user has access to this company
      const hasAccess = await this.userEmpresaRepository.findOne({
        where: { email, empresaId }
      });

      if (!hasAccess) {
        console.log('✗ Usuario no tiene acceso a esta empresa');
        throw new UnauthorizedException('No tiene acceso a esta empresa');
      }

      console.log('Usuario obtenido:', {
        id: user.id,
        email: user.email,
        name: user.name,
        empresaId: user.empresaId
      });

      const cleanPassword = password.trim();
      const cleanHash = user.passwordHash.trim();

      const isPasswordValid = await bcrypt.compare(cleanPassword, cleanHash);
      console.log('isPasswordValid:', isPasswordValid);

      if (isPasswordValid) {
        console.log('✓ La contraseña coincide - autenticación exitosa');
        const { passwordHash, ...result } = user;
        return { ...result, selectedEmpresaId: empresaId };
      } else {
        console.log('✗ La contraseña NO coincide');
        return null;
      }
    } catch (error) {
      console.error('✗ Error al validar usuario:', error.message);
      throw error;
    }
  }

  async login(user: any) {
    const empresa = await this.empresaRepository.findOne({
      where: { id: user.selectedEmpresaId },
      select: ['id', 'nombre', 'codigoAlterno', 'direccion', 'ident', 'telefono', 'logo']
    });

    const payload = {
      email: user.email,
      sub: user.id,
      empresaId: user.selectedEmpresaId
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.email,
        email: user.email,
        role: user.role || 'user',
        name: user.name || 'Usuario',
        empresaId: user.selectedEmpresaId,
        empresa: empresa ? {
          id: empresa.id,
          nombre: empresa.nombre,
          codigoAlterno: empresa.codigoAlterno
        } : null
      },
    };
  }
}