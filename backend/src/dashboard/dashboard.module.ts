import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { ProductSchema } from "../inventory/schemas/product.schema";
import { SaleSchema } from "../inventory/schemas/sale.schema";
import { CategorySchema } from "../inventory/schemas/category.schema";
import { Product } from "../inventory/schemas/product.schema";
import { Sale } from "../inventory/schemas/sale.schema";
import { Category } from "../inventory/schemas/category.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Sale.name, schema: SaleSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
