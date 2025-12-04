import { PartialType } from '@nestjs/swagger';
import { CreateTipoIdentDto } from './create-tipo-ident.dto';

export class UpdateTipoIdentDto extends PartialType(CreateTipoIdentDto) { }
