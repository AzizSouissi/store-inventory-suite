import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class DashboardStatsDto {
  @ApiProperty({ example: 145, type: Number })
  totalProducts!: number;

  @ApiProperty({ example: 12, type: Number })
  totalCategories!: number;

  @ApiProperty({ example: 523, type: Number })
  totalSales!: number;

  @ApiProperty({ example: 5234.75, type: Number })
  totalRevenue!: number;

  @ApiProperty({ example: 25.5, type: Number })
  avgPrice!: number;

  @ApiProperty({
    type: "object",
    example: {
      id: "65f1c2d3a4b5c6d7e8f90123",
      name: "Premium Coffee",
      revenue: 1250.5,
    },
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      revenue: { type: "number" },
    },
  })
  topProduct!: { id: string; name: string; revenue: number };
}

export class CategoryCountDto {
  @ApiProperty({ example: "Beverages" })
  category!: string;

  @ApiProperty({ example: 42, type: Number })
  count!: number;
}

export class SalesPerProductDto {
  @ApiProperty({ example: "Premium Coffee" })
  product!: string;

  @ApiProperty({ example: 1250.5, type: Number })
  revenue!: number;

  @ApiProperty({ example: 25, type: Number })
  quantity!: number;
}

export class DashboardChartsDto {
  @ApiProperty({ type: [CategoryCountDto] })
  productsPerCategory!: CategoryCountDto[];

  @ApiProperty({ type: [SalesPerProductDto] })
  salesPerProduct!: SalesPerProductDto[];
}

export class PaginatedProductsDto {
  @ApiProperty({ type: Number, example: 0 })
  pageNumber!: number;

  @ApiProperty({ type: Number, example: 10 })
  pageSize!: number;

  @ApiProperty({ type: Number, example: 145 })
  totalElements!: number;

  @ApiProperty({ type: Number, example: 15 })
  totalPages!: number;

  @ApiProperty({ type: "array" })
  content!: unknown[];
}

export class PaginatedSalesDto {
  @ApiProperty({ type: Number, example: 0 })
  pageNumber!: number;

  @ApiProperty({ type: Number, example: 10 })
  pageSize!: number;

  @ApiProperty({ type: Number, example: 523 })
  totalElements!: number;

  @ApiProperty({ type: Number, example: 53 })
  totalPages!: number;

  @ApiProperty({ type: "array" })
  content!: unknown[];
}

export class DashboardTablesDto {
  @ApiProperty()
  products!: PaginatedProductsDto;

  @ApiProperty()
  recentSales!: PaginatedSalesDto;
}

export class DashboardResponseDto {
  @ApiProperty()
  stats!: DashboardStatsDto;

  @ApiProperty()
  charts!: DashboardChartsDto;

  @ApiProperty()
  tables!: DashboardTablesDto;
}
