import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';
import { StockMovementReason } from '../../enums/stock-movement-reason.enum';

export class DamageReportDto {
  @IsNotEmpty()
  productId!: string;

  @IsNotEmpty()
  batchId!: string;

  @IsNumber()
  @Min(0.001)
  quantity!: number;

  @IsNotEmpty()
  @IsIn([StockMovementReason.WASTE, StockMovementReason.SPOILAGE])
  reason!: StockMovementReason;

  @IsOptional()
  @MaxLength(1000)
  note?: string | null;

  @IsOptional()
  @IsBoolean()
  draft?: boolean;
}
