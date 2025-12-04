import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { YearsService } from './years.service';
import { CreateYearsDto } from './dto/create-years.dto';
import { UpdateYearsDto } from './dto/update-years.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('years')
@UseGuards(JwtAuthGuard)
export class YearsController {
    constructor(private readonly yearsService: YearsService) { }

    @Post()
    create(@Body() createYearsDto: CreateYearsDto) {
        return this.yearsService.create(createYearsDto);
    }

    @Get()
    findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        return this.yearsService.findAll(page, limit);
    }

    @Get(':year')
    findOne(@Param('year') year: string) {
        return this.yearsService.findOne(+year);
    }

    @Put(':year')
    update(@Param('year') year: string, @Body() updateYearsDto: UpdateYearsDto) {
        return this.yearsService.update(+year, updateYearsDto);
    }

    @Delete(':year')
    remove(@Param('year') year: string) {
        return this.yearsService.remove(+year);
    }
}
