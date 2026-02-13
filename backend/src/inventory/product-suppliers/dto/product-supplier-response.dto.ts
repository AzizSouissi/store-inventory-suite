export class ProductSupplierResponseDto {
  id!: string;
  productId!: string;
  supplierId!: string;
  supplierName!: string;
  negotiatedPrice?: number | null;
  note?: string | null;
  updatedAt?: string | null;
}
