import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateProfesionDto } from './dto/create-profesion.dto';
import { UpdateProfesionDto } from './dto/update-profesion.dto';
import { Profesion } from './entities/profesion.entity';

@Injectable()
export class ProfesionesService {
  constructor(
    @InjectRepository(Profesion)
    private readonly profesionRepository: Repository<Profesion>,
    private readonly dataSource: DataSource
  ) { }

  async create(createProfesionDto: CreateProfesionDto, userId: number, empresaId: number) {
    const userData = await this.dataSource.query('SELECT name FROM public.users WHERE id = $1', [userId]);
    const userName = userData[0]?.name || String(userId);

    const profesion = this.profesionRepository.create({
      ...createProfesionDto,
      empresaId,
      usuario: userName
    });
    return this.profesionRepository.save(profesion);
  }

  async findAll(empresaId: number) {
    return this.profesionRepository.find({
      where: { empresaId },
      order: { nombre: 'ASC' }
    });
  }

  async findOne(id: number, empresaId: number) {
    const profesion = await this.profesionRepository.findOne({
      where: { codigo: id, empresaId }
    });
    if (!profesion) throw new NotFoundException(`Profesión #${id} no encontrada`);
    return profesion;
  }

  async update(id: number, updateProfesionDto: UpdateProfesionDto, userId: number, empresaId: number) {
    const userData = await this.dataSource.query('SELECT name FROM public.users WHERE id = $1', [userId]);
    const userName = userData[0]?.name || String(userId);

    const profesion = await this.findOne(id, empresaId);

    Object.assign(profesion, updateProfesionDto);
    profesion.usuario = userName;

    return this.profesionRepository.save(profesion);
  }

  async remove(id: number, empresaId: number) {
    const profesion = await this.findOne(id, empresaId);
    return this.profesionRepository.remove(profesion);
  }
}
