export class SaleResponseDto {
  id!: string;
  productId!: string;
  productName!: string | null;
  quantity!: number;
  unitPrice!: number;
  saleDate!: string | null;
  note!: string | null;
  performedBy!: string | null;
  createdAt!: string | null;
}
