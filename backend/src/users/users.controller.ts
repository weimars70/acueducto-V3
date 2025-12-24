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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('view')
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query() filters: Record<string, any>,
  ) {
    delete filters.page;
    delete filters.limit;

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    return this.usersService.findAll(pageNumber, pageSize, filters);
  }

  @Get('roles/by-empresa/:empresaId')
  @UseGuards(JwtAuthGuard)
  async getRolesByEmpresa(@Param('empresaId') empresaId: string) {
    return this.usersService.getRolesByEmpresa(parseInt(empresaId, 10));
  }

  @Get('tipos-cuenta/by-empresa/:empresaId')
  @UseGuards(JwtAuthGuard)
  async getTiposCuentaByEmpresa(@Param('empresaId') empresaId: string) {
    return this.usersService.getTiposCuentaByEmpresa(parseInt(empresaId, 10));
  }

  @Get('empresa-info')
  @UseGuards(JwtAuthGuard)
  async getEmpresaInfo(@Req() req) {
    const user = req.user;
    if (user && user.empresaId) {
      return this.usersService.getEmpresaInfo(user.empresaId);
    }
    throw new Error("Empresa ID not found in session");
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(parseInt(id, 10));
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(parseInt(id, 10), updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    return this.usersService.remove(parseInt(id, 10));
  }
}
