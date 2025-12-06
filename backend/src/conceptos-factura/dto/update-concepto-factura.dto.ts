import { PartialType } from '@nestjs/mapped-types';
import { CreateConceptoFacturaDto } from './create-concepto-factura.dto';

export class UpdateConceptoFacturaDto extends PartialType(CreateConceptoFacturaDto) { }
