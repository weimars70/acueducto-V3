import { PartialType } from '@nestjs/mapped-types';
import { CreateEstratoTarifaDto } from './create-estrato-tarifa.dto';

export class UpdateEstratoTarifaDto extends PartialType(CreateEstratoTarifaDto) { }
