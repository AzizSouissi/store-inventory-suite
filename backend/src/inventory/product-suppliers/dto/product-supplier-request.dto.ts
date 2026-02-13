import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  Min,
  MaxLength,
} from "class-validator";

export class ProductSupplierRequestDto {
  @IsNotEmpty()
  supplierId!: string;

  @IsNumber()
  @Min(0)
  @Max(1000000)
  negotiatedPrice!: number;

  @IsOptional()
  @MaxLength(1000)
  note?: string | null;
}
