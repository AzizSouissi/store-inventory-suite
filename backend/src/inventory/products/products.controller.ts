import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Express } from "express";
import { ProductsService } from "./products.service";
import { ProductCreateDto } from "./dto/product-create.dto";
import { ProductUpdateDto } from "./dto/product-update.dto";
import { ProductResponseDto } from "./dto/product-response.dto";
import { ProductBulkCategoryDto } from "./dto/product-bulk-category.dto";
import { ProductBulkPriceDto } from "./dto/product-bulk-price.dto";
import { StockReceiveDto } from "./dto/stock-receive.dto";
import { StockWasteDto } from "./dto/stock-waste.dto";
import { StockAdjustDto } from "./dto/stock-adjust.dto";
import { ProductImportResultDto } from "./dto/product-import-result.dto";
import { BatchResponseDto } from "./dto/batch-response.dto";
import { StockMovementResponseDto } from "./dto/stock-movement-response.dto";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../auth/roles.enum";

@Controller("products")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.STAFF)
  create(@Body() request: ProductCreateDto): Promise<ProductResponseDto> {
    return this.productsService.create(request);
  }

  @Put(":id")
  @Roles(Role.ADMIN, Role.STAFF)
  update(
    @Param("id") id: string,
    @Body() request: ProductUpdateDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.update(id, request);
  }

  @Delete(":id")
  @Roles(Role.ADMIN)
  async delete(@Param("id") id: string): Promise<void> {
    await this.productsService.delete(id);
  }

  @Get(":id")
  @Roles(Role.ADMIN, Role.STAFF)
  getById(@Param("id") id: string): Promise<ProductResponseDto> {
    return this.productsService.getById(id);
  }

  @Get("by-barcode/:barcode")
  @Roles(Role.ADMIN, Role.STAFF)
  getByBarcode(@Param("barcode") barcode: string): Promise<ProductResponseDto> {
    return this.productsService.getByBarcode(barcode);
  }

  @Post(":id/stock/receive")
  @Roles(Role.ADMIN, Role.STAFF)
  receiveStock(
    @Param("id") id: string,
    @Body() request: StockReceiveDto,
    @Req() req: { user?: { username?: string } },
  ): Promise<ProductResponseDto> {
    const performedBy = req.user?.username ?? "system";
    return this.productsService.receiveStock(id, request, performedBy);
  }

  @Post(":id/stock/waste")
  @Roles(Role.ADMIN, Role.STAFF)
  wasteStock(
    @Param("id") id: string,
    @Body() request: StockWasteDto,
    @Req() req: { user?: { username?: string } },
  ): Promise<ProductResponseDto> {
    const performedBy = req.user?.username ?? "system";
    return this.productsService.wasteStock(id, request, performedBy);
  }

  @Post(":id/stock/adjust")
  @Roles(Role.ADMIN, Role.STAFF)
  adjustStock(
    @Param("id") id: string,
    @Body() request: StockAdjustDto,
    @Req() req: { user?: { username?: string } },
  ): Promise<ProductResponseDto> {
    const performedBy = req.user?.username ?? "system";
    return this.productsService.adjustStock(id, request, performedBy);
  }

  @Get(":id/stock/movements")
  @Roles(Role.ADMIN, Role.STAFF)
  getMovements(
    @Param("id") id: string,
    @Query("page") page = "0",
    @Query("size") size = "20",
  ): Promise<{
    content: StockMovementResponseDto[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  }> {
    return this.productsService.getStockMovements(
      id,
      Number(page),
      Number(size),
    );
  }

  @Get(":id/stock/batches")
  @Roles(Role.ADMIN, Role.STAFF)
  getBatches(
    @Param("id") id: string,
    @Query("availableOnly") availableOnly = "true",
  ): Promise<BatchResponseDto[]> {
    return this.productsService.getBatches(id, availableOnly !== "false");
  }

  @Get()
  @Roles(Role.ADMIN, Role.STAFF)
  getAll(
    @Query("page") page = "0",
    @Query("size") size = "20",
    @Query("sortBy") sortBy = "name",
    @Query("sortDir") sortDir = "asc",
    @Query("name") name?: string,
    @Query("categoryId") categoryId?: string,
    @Query("supplierId") supplierId?: string,
  ): Promise<{
    content: ProductResponseDto[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  }> {
    return this.productsService.getAll(
      Number(page),
      Number(size),
      sortBy,
      sortDir,
      name,
      categoryId,
      supplierId,
    );
  }

  @Get("alerts/low-stock")
  @Roles(Role.ADMIN, Role.STAFF)
  getLowStockAlerts(): Promise<ProductResponseDto[]> {
    return this.productsService.getLowStockAlerts();
  }

  @Get("reorder-list")
  @Roles(Role.ADMIN, Role.STAFF)
  getReorderList() {
    return this.productsService.getReorderList();
  }

  @Post(":id/alerts/snooze")
  @Roles(Role.ADMIN, Role.STAFF)
  async snoozeLowStock(
    @Param("id") id: string,
    @Query("days") days = "7",
  ): Promise<void> {
    const until = new Date();
    until.setDate(until.getDate() + Number(days));
    await this.productsService.snoozeLowStock(id, until);
  }

  @Patch("bulk/category")
  @Roles(Role.ADMIN)
  async bulkUpdateCategory(
    @Body() request: ProductBulkCategoryDto,
  ): Promise<void> {
    await this.productsService.bulkUpdateCategory(request);
  }

  @Patch("bulk/price")
  @Roles(Role.ADMIN)
  async bulkUpdatePrice(@Body() request: ProductBulkPriceDto): Promise<void> {
    await this.productsService.bulkUpdatePrice(request);
  }

  @Post("import-csv")
  @UseInterceptors(FileInterceptor("file"))
  @Roles(Role.ADMIN)
  importCsv(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ProductImportResultDto> {
    return this.productsService.importCsv(file);
  }
}
