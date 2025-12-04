import { PartialType } from '@nestjs/swagger';
import { CreateTipoImpuestoDto } from './create-tipo-impuesto.dto';

export class UpdateTipoImpuestoDto extends PartialType(CreateTipoImpuestoDto) { }
