import { StockMovementReason } from "../../enums/stock-movement-reason.enum";

export class StockMovementResponseDto {
  id!: string;
  productId!: string;
  delta!: number;
  reason!: StockMovementReason;
  batchId?: string | null;
  supplierId?: string | null;
  unitCost?: number | null;
  note?: string | null;
  performedBy?: string | null;
  createdAt?: string | null;
}
