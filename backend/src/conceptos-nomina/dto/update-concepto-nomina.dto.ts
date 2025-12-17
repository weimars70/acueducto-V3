import { PartialType } from '@nestjs/mapped-types';
import { CreateConceptoNominaDto } from './create-concepto-nomina.dto';

export class UpdateConceptoNominaDto extends PartialType(CreateConceptoNominaDto) {}
