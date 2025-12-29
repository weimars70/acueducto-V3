import { PartialType } from '@nestjs/mapped-types';
import { CreateInstalacionDto } from './create-instalacion.dto';

export class UpdateInstalacionDto extends PartialType(CreateInstalacionDto) {}
