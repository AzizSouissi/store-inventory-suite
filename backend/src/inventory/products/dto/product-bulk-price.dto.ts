import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsNumber, Max, Min } from "class-validator";

export class ProductBulkPriceDto {
  @ApiProperty({ type: [String], example: ["65f1c2d3a4b5c6d7e8f90123"] })
  @ArrayNotEmpty()
  productIds!: string[];

  @ApiProperty({ example: 19.99, type: Number })
  @IsNumber()
  @Min(0)
  @Max(1000000)
  price!: number;
}
