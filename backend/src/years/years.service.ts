import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Years } from '../entities/years.entity';
import { CreateYearsDto } from './dto/create-years.dto';
import { UpdateYearsDto } from './dto/update-years.dto';

@Injectable()
export class YearsService {
    constructor(
        @InjectRepository(Years)
        private readonly yearsRepository: Repository<Years>,
    ) { }

    async create(createYearsDto: CreateYearsDto): Promise<Years> {
        const existing = await this.yearsRepository.findOne({
            where: { year: createYearsDto.year }
        });

        if (existing) {
            throw new ConflictException('Ya existe ese año registrado');
        }

        const year = this.yearsRepository.create(createYearsDto);
        return await this.yearsRepository.save(year);
    }

    async findAll(page: number = 1, limit: number = 10): Promise<{ data: Years[], total: number }> {
        const skip = (page - 1) * limit;

        const [data, total] = await this.yearsRepository.findAndCount({
            order: { year: 'DESC' },
            skip,
            take: limit
        });

        return { data, total };
    }

    async findOne(year: number): Promise<Years> {
        const years = await this.yearsRepository.findOne({ where: { year } });
        if (!years) {
            throw new NotFoundException(`Año ${year} no encontrado`);
        }
        return years;
    }

    async update(year: number, updateYearsDto: UpdateYearsDto): Promise<Years> {
        const years = await this.findOne(year);
        Object.assign(years, updateYearsDto);
        return await this.yearsRepository.save(years);
    }

    async remove(year: number): Promise<void> {
        const result = await this.yearsRepository.delete(year);
        if (result.affected === 0) {
            throw new NotFoundException(`Año ${year} no encontrado`);
        }
    }
}
