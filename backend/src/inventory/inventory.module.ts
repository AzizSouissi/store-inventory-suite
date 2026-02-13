import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsController } from './products/products.controller';
import { ProductsService } from './products/products.service';
import { CategoriesController } from './categories/categories.controller';
import { CategoriesService } from './categories/categories.service';
import { SuppliersController } from './suppliers/suppliers.controller';
import { SuppliersService } from './suppliers/suppliers.service';
import { ProductSuppliersController } from './product-suppliers/product-suppliers.controller';
import { ProductSuppliersService } from './product-suppliers/product-suppliers.service';
import { Product, ProductSchema } from './schemas/product.schema';
import { Category, CategorySchema } from './schemas/category.schema';
import { Supplier, SupplierSchema } from './schemas/supplier.schema';
import {
  ProductSupplier,
  ProductSupplierSchema,
} from './schemas/product-supplier.schema';
import {
  ProductSupplierHistory,
  ProductSupplierHistorySchema,
} from './schemas/product-supplier-history.schema';
import {
  InventoryBatch,
  InventoryBatchSchema,
} from './schemas/inventory-batch.schema';
import {
  StockMovement,
  StockMovementSchema,
} from './schemas/stock-movement.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Supplier.name, schema: SupplierSchema },
      { name: ProductSupplier.name, schema: ProductSupplierSchema },
      {
        name: ProductSupplierHistory.name,
        schema: ProductSupplierHistorySchema,
      },
      { name: InventoryBatch.name, schema: InventoryBatchSchema },
      { name: StockMovement.name, schema: StockMovementSchema },
    ]),
  ],
  controllers: [
    ProductsController,
    CategoriesController,
    SuppliersController,
    ProductSuppliersController,
  ],
  providers: [
    ProductsService,
    CategoriesService,
    SuppliersService,
    ProductSuppliersService,
  ],
})
export class InventoryModule {}
