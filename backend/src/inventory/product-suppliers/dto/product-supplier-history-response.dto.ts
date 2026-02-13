export class ProductSupplierHistoryResponseDto {
  id!: string;
  productId!: string;
  supplierId!: string;
  supplierName!: string;
  negotiatedPrice?: number | null;
  note?: string | null;
  updatedBy?: string | null;
  effectiveAt?: string | null;
}
