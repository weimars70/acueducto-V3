import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoRegimenDto } from './create-tipo-regimen.dto';

export class UpdateTipoRegimenDto extends PartialType(CreateTipoRegimenDto) { }
