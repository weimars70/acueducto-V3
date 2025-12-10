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
  Req,
} from '@nestjs/common';
import { ComprasService } from './compras.service';
import { CreateCompraDto } from './dto/create-compra.dto';
import { UpdateCompraDto } from './dto/update-compra.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('compras')
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) { }

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

    return this.comprasService.findAll(pageNumber, pageSize, filters);
  }

  @Get('proveedores')
  async getProveedores() {
    return this.comprasService.getProveedores();
  }

  @Get('items')
  @UseGuards(JwtAuthGuard)
  async getItems(@Req() req) {
    const empresaId = req.user.empresaId;
    return this.comprasService.getItems(empresaId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.comprasService.findOne(parseInt(id, 10));
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createCompraDto: CreateCompraDto, @Req() req) {
    // Assuming req.user contains the decoded JWT payload with sub (userId) and empresaId
    const userId = req.user.userId;
    const empresaId = req.user.empresaId;
    return this.comprasService.create(createCompraDto, userId, empresaId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateCompraDto: UpdateCompraDto,
  ) {
    return this.comprasService.update(parseInt(id, 10), updateCompraDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    return this.comprasService.remove(parseInt(id, 10));
  }
}
