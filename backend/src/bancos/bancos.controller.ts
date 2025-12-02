import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BancosService } from './bancos.service';
import { CreateBancoDto } from './dto/create-banco.dto';
import { UpdateBancoDto } from './dto/update-banco.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('bancos')
export class BancosController {
  constructor(private readonly bancosService: BancosService) {}

  @Get('view')
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query() filters: Record<string, any>,
  ) {
    delete filters.page;
    delete filters.limit;

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    return this.bancosService.findAll(pageNumber, pageSize, filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.bancosService.findOne(parseInt(id, 10));
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createBancoDto: CreateBancoDto) {
    return this.bancosService.create(createBancoDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateBancoDto: UpdateBancoDto,
  ) {
    return this.bancosService.update(parseInt(id, 10), updateBancoDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    return this.bancosService.remove(parseInt(id, 10));
  }
}
