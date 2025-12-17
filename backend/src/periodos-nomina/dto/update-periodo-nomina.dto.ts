import { PartialType } from '@nestjs/mapped-types';
import { CreatePeriodoNominaDto } from './create-periodo-nomina.dto';

export class UpdatePeriodoNominaDto extends PartialType(CreatePeriodoNominaDto) {}
