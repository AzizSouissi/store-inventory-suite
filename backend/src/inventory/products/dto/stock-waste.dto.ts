import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
} from "class-validator";
import { StockMovementReason } from "../../enums/stock-movement-reason.enum";

export class StockWasteDto {
  @IsNotEmpty()
  batchId!: string;

  @IsNumber()
  @Min(0.001)
  quantity!: number;

  @IsNotEmpty()
  reason!: StockMovementReason;

  @IsOptional()
  @MaxLength(1000)
  note?: string | null;
}
