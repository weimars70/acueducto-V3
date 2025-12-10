import { PartialType } from '@nestjs/swagger';
import { CreateTiposAjusteInventarioDto } from './create-tipos-ajuste-inventario.dto';

export class UpdateTiposAjusteInventarioDto extends PartialType(CreateTiposAjusteInventarioDto) {}
