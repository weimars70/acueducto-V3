import { PartialType } from '@nestjs/mapped-types';
import { CreateEstratoDto } from './create-estrato.dto';

export class UpdateEstratoDto extends PartialType(CreateEstratoDto) { }
