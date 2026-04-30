import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  Min,
  MaxLength,
} from "class-validator";

export class ProductSupplierRequestDto {
  @ApiProperty({ example: "65f1c2d3a4b5c6d7e8f90124" })
  @IsNotEmpty()
  supplierId!: string;

  @ApiProperty({ example: 7.5, type: Number })
  @IsNumber()
  @Min(0)
  @Max(1000000)
  negotiatedPrice!: number;

  @ApiPropertyOptional({ example: "Special bulk price" })
  @IsOptional()
  @MaxLength(1000)
  note?: string | null;
}
