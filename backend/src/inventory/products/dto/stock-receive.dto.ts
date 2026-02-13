import {
  IsDateString,
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
} from "class-validator";

export class StockReceiveDto {
  @IsNumber()
  @Min(0.001)
  quantity!: number;

  @IsOptional()
  supplierId?: string | null;

  @IsNumber()
  @Min(0.001)
  costPrice!: number;

  @IsOptional()
  @MaxLength(128)
  lotNumber?: string | null;

  @IsOptional()
  @IsDateString()
  expiryDate?: string | null;

  @IsOptional()
  @MaxLength(1000)
  note?: string | null;
}
