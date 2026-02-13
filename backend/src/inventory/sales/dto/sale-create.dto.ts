import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
} from "class-validator";

export class SaleCreateDto {
  @IsNotEmpty()
  productId!: string;

  @IsNumber()
  @Min(0.001)
  quantity!: number;

  @IsNumber()
  @Min(0.01)
  unitPrice!: number;

  @IsDateString()
  saleDate!: string;

  @IsOptional()
  @MaxLength(1000)
  note?: string | null;
}
