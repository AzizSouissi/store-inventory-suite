import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
} from "class-validator";

export class StockReceiveDto {
  @ApiProperty({ example: 10, type: Number })
  @IsNumber()
  @Min(0.001)
  quantity!: number;

  @ApiPropertyOptional({ example: "65f1c2d3a4b5c6d7e8f90124" })
  @IsOptional()
  supplierId?: string | null;

  @ApiProperty({ example: 8.75, type: Number })
  @IsNumber()
  @Min(0.001)
  costPrice!: number;

  @ApiPropertyOptional({ example: "LOT-2026-04" })
  @IsOptional()
  @MaxLength(128)
  lotNumber?: string | null;

  @ApiPropertyOptional({ example: "2026-12-31" })
  @IsOptional()
  @IsDateString()
  expiryDate?: string | null;

  @ApiPropertyOptional({ example: "Initial stock receipt" })
  @IsOptional()
  @MaxLength(1000)
  note?: string | null;
}
