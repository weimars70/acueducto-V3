import { PartialType } from '@nestjs/swagger';
import { CreateMarcaMedidorDto } from './create-marca-medidor.dto';

export class UpdateMarcaMedidorDto extends PartialType(CreateMarcaMedidorDto) {}
