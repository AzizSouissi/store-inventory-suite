import { IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class CategoryUpdateDto {
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000000)
  defaultLowStockThreshold?: number | null;
}
