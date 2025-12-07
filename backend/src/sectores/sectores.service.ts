import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';
import { Sector } from './entities/sector.entity';

@Injectable()
export class SectoresService {
  constructor(
    @InjectRepository(Sector)
    private readonly sectorRepository: Repository<Sector>,
    private readonly dataSource: DataSource
  ) { }

  async create(createSectorDto: CreateSectorDto, userId: number, empresaId: number) {
    const userData = await this.dataSource.query('SELECT name FROM public.users WHERE id = $1', [userId]);
    const userName = userData[0]?.name || String(userId);

    const sector = this.sectorRepository.create({
      ...createSectorDto,
      empresaId,
      usuario: userName
    });
    return this.sectorRepository.save(sector);
  }

  async findAll(empresaId: number) {
    return this.sectorRepository.find({
      where: { empresaId },
      order: { nombre: 'ASC' }
    });
  }

  async findOne(id: number, empresaId: number) {
    const sector = await this.sectorRepository.findOne({
      where: { codigo: id, empresaId }
    });
    if (!sector) throw new NotFoundException(`Sector #${id} not found`);
    return sector;
  }

  async update(id: number, updateSectorDto: UpdateSectorDto, userId: number, empresaId: number) {
    const userData = await this.dataSource.query('SELECT name FROM public.users WHERE id = $1', [userId]);
    const userName = userData[0]?.name || String(userId);

    const sector = await this.findOne(id, empresaId);

    Object.assign(sector, updateSectorDto);
    sector.usuario = userName;

    return this.sectorRepository.save(sector);
  }

  async remove(id: number, empresaId: number) {
    const sector = await this.findOne(id, empresaId);
    return this.sectorRepository.remove(sector);
  }
}
