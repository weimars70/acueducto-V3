import { PartialType } from '@nestjs/swagger';
import { CreateNotaDebitoConceptoDto } from './create-nota-debito-concepto.dto';

export class UpdateNotaDebitoConceptoDto extends PartialType(CreateNotaDebitoConceptoDto) { }
