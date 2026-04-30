import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
} from "class-validator";
import { StockMovementReason } from "../../enums/stock-movement-reason.enum";

export class StockAdjustDto {
  @ApiProperty({ example: 2.5, type: Number })
  @IsNumber()
  @Min(0.001)
  quantity!: number;

  @ApiProperty({
    enum: StockMovementReason,
    example: StockMovementReason.ADJUSTMENT,
  })
  @IsNotEmpty()
  reason!: StockMovementReason;

  @ApiProperty({ example: true })
  @IsBoolean()
  increase!: boolean;

  @ApiPropertyOptional({ example: "Damaged packaging" })
  @IsOptional()
  @MaxLength(1000)
  note?: string | null;
}
