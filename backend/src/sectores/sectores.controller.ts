import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { SectoresService } from './sectores.service';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('sectores')
@UseGuards(JwtAuthGuard)
export class SectoresController {
  constructor(private readonly sectoresService: SectoresService) { }

  @Post()
  create(@Body() createSectorDto: CreateSectorDto, @Req() req) {
    console.log('Creating sector', createSectorDto, req.user);
    return this.sectoresService.create(createSectorDto, req.user.userId, req.user.empresaId);
  }

  @Get()
  findAll(@Req() req) {
    console.log('Finding all sectores for user', req.user);
    return this.sectoresService.findAll(req.user.empresaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.sectoresService.findOne(+id, req.user.empresaId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSectorDto: UpdateSectorDto, @Req() req) {
    return this.sectoresService.update(+id, updateSectorDto, req.user.userId, req.user.empresaId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.sectoresService.remove(+id, req.user.empresaId);
  }
}
