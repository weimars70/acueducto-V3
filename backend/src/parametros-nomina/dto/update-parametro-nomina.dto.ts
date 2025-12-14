import { PartialType } from '@nestjs/mapped-types';
import { CreateParametroNominaDto } from './create-parametro-nomina.dto';

export class UpdateParametroNominaDto extends PartialType(CreateParametroNominaDto) {}
