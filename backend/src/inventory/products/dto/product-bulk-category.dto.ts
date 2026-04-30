import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsNotEmpty } from "class-validator";

export class ProductBulkCategoryDto {
  @ApiProperty({ type: [String], example: ["65f1c2d3a4b5c6d7e8f90123"] })
  @ArrayNotEmpty()
  productIds!: string[];

  @ApiProperty({ example: "65f1c2d3a4b5c6d7e8f90123" })
  @IsNotEmpty()
  categoryId!: string;
}
