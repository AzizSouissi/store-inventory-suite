import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  DashboardResponseDto,
  DashboardStatsDto,
  DashboardChartsDto,
  CategoryCountDto,
  SalesPerProductDto,
  DashboardTablesDto,
  PaginatedProductsDto,
  PaginatedSalesDto,
} from "./dashboard.dto";
import { Product } from "../inventory/schemas/product.schema";
import { Sale } from "../inventory/schemas/sale.schema";
import { Category } from "../inventory/schemas/category.schema";

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(Sale.name) private readonly saleModel: Model<Sale>,
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
  ) {}

  async getDashboard(): Promise<DashboardResponseDto> {
    const [stats, charts, tables] = await Promise.all([
      this.getStats(),
      this.getCharts(),
      this.getTables(),
    ]);

    return {
      stats,
      charts,
      tables,
    };
  }

  private async getStats(): Promise<DashboardStatsDto> {
    const [totalProducts, totalCategories, totalSales, salesData] =
      await Promise.all([
        this.productModel.countDocuments(),
        this.categoryModel.countDocuments(),
        this.saleModel.countDocuments(),
        this.saleModel.find().exec(),
      ]);

    let totalRevenue = 0;
    let avgPrice = 0;

    if (salesData && salesData.length > 0) {
      totalRevenue = salesData.reduce((sum, sale) => {
        return sum + sale.quantity * sale.unitPrice;
      }, 0);
    }

    const products = await this.productModel.find().exec();
    if (products && products.length > 0) {
      const priceSum = products.reduce((sum, p) => sum + p.price, 0);
      avgPrice = priceSum / products.length;
    }

    // Find top product by revenue
    const topProductData = await this.saleModel.aggregate([
      {
        $group: {
          _id: "$productId",
          totalRevenue: {
            $sum: { $multiply: ["$quantity", "$unitPrice"] },
          },
          totalQuantity: { $sum: "$quantity" },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 1 },
    ]);

    let topProduct = { id: "", name: "", revenue: 0 };
    if (topProductData && topProductData.length > 0) {
      const topProductId = topProductData[0]._id;
      const productInfo = await this.productModel.findById(topProductId).exec();
      if (productInfo) {
        topProduct = {
          id: topProductId,
          name: productInfo.name,
          revenue: topProductData[0].totalRevenue,
        };
      }
    }

    return {
      totalProducts,
      totalCategories,
      totalSales,
      totalRevenue,
      avgPrice: Math.round(avgPrice * 100) / 100,
      topProduct,
    };
  }

  private async getCharts(): Promise<DashboardChartsDto> {
    const [productsPerCategory, salesPerProduct] = await Promise.all([
      this.getProductsPerCategory(),
      this.getSalesPerProduct(),
    ]);

    return {
      productsPerCategory,
      salesPerProduct,
    };
  }

  private async getProductsPerCategory(): Promise<CategoryCountDto[]> {
    const categories = await this.categoryModel.find().exec();
    const result: CategoryCountDto[] = [];

    for (const category of categories) {
      const count = await this.productModel.countDocuments({
        categoryId: category._id.toString(),
      });
      result.push({
        category: category.name,
        count,
      });
    }

    return result;
  }

  private async getSalesPerProduct(): Promise<SalesPerProductDto[]> {
    const salesAgg = await this.saleModel.aggregate([
      {
        $group: {
          _id: "$productId",
          totalRevenue: {
            $sum: { $multiply: ["$quantity", "$unitPrice"] },
          },
          totalQuantity: { $sum: "$quantity" },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
    ]);

    const result: SalesPerProductDto[] = [];

    for (const sale of salesAgg) {
      const product = await this.productModel.findById(sale._id).exec();
      if (product) {
        result.push({
          product: product.name,
          revenue: sale.totalRevenue,
          quantity: sale.totalQuantity,
        });
      }
    }

    return result;
  }

  private async getTables(): Promise<DashboardTablesDto> {
    const [products, recentSales] = await Promise.all([
      this.getProductsTable(),
      this.getRecentSalesTable(),
    ]);

    return {
      products,
      recentSales,
    };
  }

  private async getProductsTable(): Promise<PaginatedProductsDto> {
    const page = 0;
    const size = 10;
    const skip = page * size;

    const [content, totalElements] = await Promise.all([
      this.productModel.find().skip(skip).limit(size).exec(),
      this.productModel.countDocuments(),
    ]);

    const totalPages = Math.ceil(totalElements / size);

    return {
      pageNumber: page,
      pageSize: size,
      totalElements,
      totalPages,
      content: content.map((p) => ({
        id: p._id,
        name: p.name,
        barcode: p.barcode,
        categoryId: p.categoryId,
        price: p.price,
        quantity: p.quantity,
        unit: p.unit,
        lowStockThreshold: p.lowStockThreshold,
      })),
    };
  }

  private async getRecentSalesTable(): Promise<PaginatedSalesDto> {
    const page = 0;
    const size = 10;
    const skip = page * size;

    const [content, totalElements] = await Promise.all([
      this.saleModel
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(size)
        .exec(),
      this.saleModel.countDocuments(),
    ]);

    const totalPages = Math.ceil(totalElements / size);

    // Enrich sales with product names
    const enrichedContent = await Promise.all(
      content.map(async (sale) => {
        const product = await this.productModel.findById(sale.productId).exec();
        return {
          id: sale._id,
          productId: sale.productId,
          productName: product?.name || "Unknown",
          quantity: sale.quantity,
          unitPrice: sale.unitPrice,
          totalPrice: sale.quantity * sale.unitPrice,
          saleDate: sale.saleDate,
          note: sale.note,
          performedBy: sale.performedBy,
        };
      }),
    );

    return {
      pageNumber: page,
      pageSize: size,
      totalElements,
      totalPages,
      content: enrichedContent,
    };
  }
}
