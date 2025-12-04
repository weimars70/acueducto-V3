import { PartialType } from '@nestjs/swagger';
import { CreateCentroCostosDto } from './create-centro-costos.dto';

export class UpdateCentroCostosDto extends PartialType(CreateCentroCostosDto) {}
