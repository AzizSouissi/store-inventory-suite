import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
} from "class-validator";
import { StockMovementReason } from "../../enums/stock-movement-reason.enum";

export class StockWasteDto {
  @ApiProperty({ example: "65f1c2d3a4b5c6d7e8f90125" })
  @IsNotEmpty()
  batchId!: string;

  @ApiProperty({ example: 1.5, type: Number })
  @IsNumber()
  @Min(0.001)
  quantity!: number;

  @ApiProperty({
    enum: StockMovementReason,
    example: StockMovementReason.WASTE,
  })
  @IsNotEmpty()
  reason!: StockMovementReason;

  @ApiPropertyOptional({ example: "Expired on shelf" })
  @IsOptional()
  @MaxLength(1000)
  note?: string | null;
}
