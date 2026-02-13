import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProductSuppliersService } from './product-suppliers.service';
import { ProductSupplierRequestDto } from './dto/product-supplier-request.dto';
import { ProductSupplierResponseDto } from './dto/product-supplier-response.dto';
import { ProductSupplierHistoryResponseDto } from './dto/product-supplier-history-response.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../auth/roles.enum';

@Controller('products/:productId/suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductSuppliersController {
  constructor(
    private readonly productSuppliersService: ProductSuppliersService,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.STAFF)
  upsert(
    @Param('productId') productId: string,
    @Body() request: ProductSupplierRequestDto,
    @Req() req: { user?: { username?: string } },
  ): Promise<ProductSupplierResponseDto> {
    const updatedBy = req.user?.username ?? 'system';
    return this.productSuppliersService.upsert(productId, request, updatedBy);
  }

  @Get()
  @Roles(Role.ADMIN, Role.STAFF)
  getSuppliers(
    @Param('productId') productId: string,
  ): Promise<ProductSupplierResponseDto[]> {
    return this.productSuppliersService.getSuppliersForProduct(productId);
  }

  @Get('history')
  @Roles(Role.ADMIN, Role.STAFF)
  getHistory(
    @Param('productId') productId: string,
  ): Promise<ProductSupplierHistoryResponseDto[]> {
    return this.productSuppliersService.getHistoryForProduct(productId);
  }

  @Get('by-supplier/:supplierId')
  @Roles(Role.ADMIN, Role.STAFF)
  getProductsForSupplier(
    @Param('supplierId') supplierId: string,
  ): Promise<ProductSupplierResponseDto[]> {
    return this.productSuppliersService.getProductsForSupplier(supplierId);
  }
}
