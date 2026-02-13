import { Unit } from "../../enums/unit.enum";

export class ProductReorderResponseDto {
  id!: string;
  name!: string;
  categoryId!: string;
  unit!: Unit;
  quantity?: number | null;
  lowStockThreshold?: number | null;
  suggestedOrderQuantity!: number;
}
