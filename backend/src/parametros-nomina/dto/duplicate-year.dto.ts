import { IsNumber } from 'class-validator';

export class DuplicateYearDto {
  @IsNumber()
  sourceYear: number;

  @IsNumber()
  targetYear: number;
}
