import { PartialType } from '@nestjs/mapped-types';
import { CreateNotasCreditoDto } from './create-notas-credito.dto';

export class UpdateNotasCreditoDto extends PartialType(CreateNotasCreditoDto) {}
