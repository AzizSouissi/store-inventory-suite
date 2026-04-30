import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, Max, Min } from "class-validator";

export class CategoryCreateDto {
  @ApiProperty({ example: "Beverages" })
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    example: 25,
    type: Number,
    minimum: 0,
    maximum: 1000000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000000)
  defaultLowStockThreshold?: number | null;
}
