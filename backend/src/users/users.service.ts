import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { TipoCuenta } from '../entities/tipo-cuenta.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(TipoCuenta)
    private readonly tipoCuentaRepository: Repository<TipoCuenta>,
    @InjectDataSource()
    private dataSource: DataSource,
  ) { }

  // Método legacy - mantener por compatibilidad si es necesario
  async findOne(username: string) {
    // Intentar buscar por email como fallback
    return this.findByEmail(username);
  }

  async findByEmail(email: string) {
    try {
      console.log('=== BUSCANDO USUARIO POR EMAIL ===');
      console.log('Email recibido:', email);

      // Primero intentar con una consulta directa para verificar
      const allUsers = await this.userRepository.query(
        `SELECT *,func_nombre_rol(role_id, empresa_id ) as n_rol FROM usuarios WHERE email = $1`,
        [email]
      );
      console.log('Resultado consulta directa (SQL raw):', JSON.stringify(allUsers, null, 2));

      const user = await this.userRepository.findOne({
        where: { email }
      });
      console.log('Usuario encontrado con TypeORM:', JSON.stringify(user, null, 2));

      if (!user) {
        console.log('Usuario NO encontrado en la base de datos');
        throw new Error('Usuario no encontrado');
      }

      // Attach role name from raw query
      if (allUsers.length > 0 && allUsers[0].n_rol) {
        (user as any).role_nombre = allUsers[0].n_rol;
      }

      console.log('Usuario encontrado exitosamente');
      return user;
    } catch (error) {
      console.error('Error al buscar usuario:', error.message);
      throw new Error(`Error al buscar usuario: ${error.message}`);
    }
  }

  async findAll(page: number = 1, limit: number = 10, filters: any = {}) {
    try {
      const query = this.dataSource
        .createQueryBuilder()
        .select('*')
        .from('view_usuarios', 'v')
        .limit(limit)
        .offset((page - 1) * limit);

      // Apply filters
      if (filters.user_name) {
        query.andWhere('LOWER(user_name) LIKE LOWER(:user_name)', {
          user_name: `%${filters.user_name}%`,
        });
      }

      if (filters.email) {
        query.andWhere('LOWER(email) LIKE LOWER(:email)', {
          email: `%${filters.email}%`,
        });
      }

      if (filters.active !== undefined) {
        query.andWhere('active = :active', { active: filters.active });
      }

      const data = await query.getRawMany();

      // Get total count
      const countQuery = this.dataSource
        .createQueryBuilder()
        .select('COUNT(*)', 'count')
        .from('view_usuarios', 'v');

      if (filters.user_name) {
        countQuery.andWhere('LOWER(user_name) LIKE LOWER(:user_name)', {
          user_name: `%${filters.user_name}%`,
        });
      }

      if (filters.email) {
        countQuery.andWhere('LOWER(email) LIKE LOWER(:email)', {
          email: `%${filters.email}%`,
        });
      }

      if (filters.active !== undefined) {
        countQuery.andWhere('active = :active', { active: filters.active });
      }

      const countResult = await countQuery.getRawOne();
      const total = parseInt(countResult.count, 10);

      return {
        data,
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new Error(`Error al obtener usuarios: ${error.message}`);
    }
  }

  async findById(id: number) {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }

      // Don't return password hash
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const user = this.userRepository.create({
        empresaId: createUserDto.empresaId,
        roleId: createUserDto.roleId,
        name: createUserDto.name,
        email: createUserDto.email,
        phone: createUserDto.phone,
        passwordHash: hashedPassword,
        active: createUserDto.active ?? true,
      });

      const savedUser = await this.userRepository.save(user);

      // Don't return password hash
      const { passwordHash, ...userWithoutPassword } = savedUser;
      return userWithoutPassword;
    } catch (error) {
      throw new Error(`Error al crear usuario: ${error.message}`);
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });

      if (!user) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }

      const updateData: any = {};

      if (updateUserDto.empresaId !== undefined) {
        updateData.empresaId = updateUserDto.empresaId;
      }
      if (updateUserDto.roleId !== undefined) {
        updateData.roleId = updateUserDto.roleId;
      }
      if (updateUserDto.name !== undefined) {
        updateData.name = updateUserDto.name;
      }
      if (updateUserDto.email !== undefined) {
        updateData.email = updateUserDto.email;
      }
      if (updateUserDto.phone !== undefined) {
        updateData.phone = updateUserDto.phone;
      }
      if (updateUserDto.active !== undefined) {
        updateData.active = updateUserDto.active;
      }
      if (updateUserDto.password) {
        updateData.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
      }

      await this.userRepository.update(id, updateData);

      const updatedUser = await this.userRepository.findOne({ where: { id } });

      // Don't return password hash
      const { passwordHash, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });

      if (!user) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }

      await this.userRepository.delete(id);

      return { message: 'Usuario eliminado exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  async getRolesByEmpresa(empresaId: number) {
    try {
      return await this.roleRepository.find({
        where: { empresaId },
        select: ['id', 'nombre'],
        order: { nombre: 'ASC' },
      });
    } catch (error) {
      throw new Error(`Error al obtener roles: ${error.message}`);
    }
  }

  async getTiposCuentaByEmpresa(empresaId: number) {
    try {
      return await this.tipoCuentaRepository.find({
        where: { empresaId },
        select: ['id', 'nombre'],
        order: { nombre: 'ASC' },
      });
    } catch (error) {
      throw new Error(`Error al obtener tipos de cuenta: ${error.message}`);
    }
  }

  async getEmpresaInfo(empresaId: number) {
    try {
      const empresaInfo = await this.userRepository.query(
        `SELECT nombre, direccion, ident, telefono, descripcion FROM public.empresas where id = $1`,
        [empresaId]
      );

      return empresaInfo[0];
    } catch (error) {
      throw new Error(`Error al obtener información de la empresa: ${error.message}`);
    }
  }
}