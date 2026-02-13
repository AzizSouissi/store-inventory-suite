import { Unit } from "../../enums/unit.enum";

export class ProductResponseDto {
  id!: string;
  name!: string;
  barcode?: string | null;
  categoryId!: string;
  primarySupplierId!: string;
  costPrice?: number | null;
  price!: number;
  quantity?: number | null;
  unit!: Unit;
  imageUrl?: string | null;
  notes?: string | null;
  lowStockThreshold?: number | null;
  lowStockSnoozedUntil?: string | null;
}
