import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
} from "class-validator";

export class SaleCreateDto {
  @ApiProperty({ example: "65f1c2d3a4b5c6d7e8f90123" })
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ example: 2, type: Number })
  @IsNumber()
  @Min(0.001)
  quantity!: number;

  @ApiProperty({ example: 5.25, type: Number })
  @IsNumber()
  @Min(0.01)
  unitPrice!: number;

  @ApiProperty({ example: "2026-04-27T10:30:00.000Z", type: String })
  @IsDateString()
  saleDate!: string;

  @ApiPropertyOptional({ example: "Cash sale" })
  @IsOptional()
  @MaxLength(1000)
  note?: string | null;
}
