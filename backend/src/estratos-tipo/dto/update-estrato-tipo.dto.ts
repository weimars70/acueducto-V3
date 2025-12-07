import { PartialType } from '@nestjs/mapped-types';
import { CreateEstratoTipoDto } from './create-estrato-tipo.dto';

export class UpdateEstratoTipoDto extends PartialType(CreateEstratoTipoDto) { }
