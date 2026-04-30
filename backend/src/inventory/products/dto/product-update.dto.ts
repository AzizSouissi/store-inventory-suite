import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { Unit } from "../../enums/unit.enum";

export class ProductUpdateDto {
  @ApiProperty({ example: "Coffee Beans 1kg" })
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({ example: "0123456789012" })
  @IsOptional()
  @MaxLength(128)
  barcode?: string | null;

  @ApiProperty({ example: "65f1c2d3a4b5c6d7e8f90123" })
  @IsNotEmpty()
  categoryId!: string;

  @ApiProperty({ example: "65f1c2d3a4b5c6d7e8f90124" })
  @IsNotEmpty()
  primarySupplierId!: string;

  @ApiProperty({ example: 12.5, type: Number })
  @IsNumber()
  @Min(0)
  @Max(1000000)
  price!: number;

  @ApiProperty({ enum: Unit, example: Unit.PIECE })
  @IsNotEmpty()
  unit!: Unit;

  @ApiPropertyOptional({ example: "https://example.com/image.png" })
  @IsOptional()
  @MaxLength(2048)
  imageUrl?: string | null;

  @ApiPropertyOptional({ example: "Seasonal product" })
  @IsOptional()
  @MaxLength(5000)
  notes?: string | null;

  @ApiProperty({ example: 10, type: Number })
  @IsNumber()
  @Min(0)
  @Max(1000000)
  lowStockThreshold!: number;
}
