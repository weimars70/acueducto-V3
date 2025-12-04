import { PartialType } from '@nestjs/mapped-types';
import { CreateYearsDto } from './create-years.dto';

export class UpdateYearsDto extends PartialType(CreateYearsDto) { }
