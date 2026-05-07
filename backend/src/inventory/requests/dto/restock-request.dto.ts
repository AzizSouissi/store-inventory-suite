import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';

export class RestockRequestDto {
  @IsNotEmpty()
  productId!: string;

  @IsNumber()
  @Min(0.001)
  quantity!: number;

  @IsOptional()
  supplierId?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0.001)
  costPrice?: number | null;

  @IsOptional()
  @MaxLength(128)
  lotNumber?: string | null;

  @IsOptional()
  @IsDateString()
  expiryDate?: string | null;

  @IsOptional()
  @MaxLength(1000)
  note?: string | null;

  @IsOptional()
  @IsBoolean()
  draft?: boolean;
}
