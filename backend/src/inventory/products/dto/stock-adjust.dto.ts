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
  @IsNumber()
  @Min(0.001)
  quantity!: number;

  @IsNotEmpty()
  reason!: StockMovementReason;

  @IsBoolean()
  increase!: boolean;

  @IsOptional()
  @MaxLength(1000)
  note?: string | null;
}
