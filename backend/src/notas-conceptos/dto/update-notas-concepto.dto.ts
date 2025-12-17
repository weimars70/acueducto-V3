import { PartialType } from '@nestjs/swagger';
import { CreateNotasConceptoDto } from './create-notas-concepto.dto';

export class UpdateNotasConceptoDto extends PartialType(CreateNotasConceptoDto) {}
