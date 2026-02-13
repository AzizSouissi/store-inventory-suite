import { ArrayNotEmpty, IsNotEmpty } from "class-validator";

export class ProductBulkCategoryDto {
  @ArrayNotEmpty()
  productIds!: string[];

  @IsNotEmpty()
  categoryId!: string;
}
