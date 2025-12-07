import { PartialType } from '@nestjs/mapped-types';
import { CreateItemGrupoDto } from './create-item-grupo.dto';

export class UpdateItemGrupoDto extends PartialType(CreateItemGrupoDto) { }
