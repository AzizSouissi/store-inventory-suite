export class BatchResponseDto {
  id!: string;
  productId!: string;
  supplierId!: string;
  supplierName?: string | null;
  lotNumber?: string | null;
  expiryDate?: string | null;
  unitCost?: number | null;
  quantityReceived?: number | null;
  quantityRemaining?: number | null;
  receivedAt?: string | null;
  note?: string | null;
}
