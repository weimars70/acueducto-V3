import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoMovimientoItemDto } from './create-tipo-movimiento-item.dto';

export class UpdateTipoMovimientoItemDto extends PartialType(CreateTipoMovimientoItemDto) { }
