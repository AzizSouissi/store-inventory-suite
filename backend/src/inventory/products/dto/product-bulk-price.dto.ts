import { ArrayNotEmpty, IsNumber, Max, Min } from "class-validator";

export class ProductBulkPriceDto {
  @ArrayNotEmpty()
  productIds!: string[];

  @IsNumber()
  @Min(0)
  @Max(1000000)
  price!: number;
}
