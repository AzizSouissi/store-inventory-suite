import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Sale } from "../schemas/sale.schema";
import { Product } from "../schemas/product.schema";
import { StockMovement } from "../schemas/stock-movement.schema";
import { StockMovementReason } from "../enums/stock-movement-reason.enum";
import { SaleCreateDto } from "./dto/sale-create.dto";
import { SaleResponseDto } from "./dto/sale-response.dto";
import { scalePrice, scaleQuantity } from "../../common/utils/number-utils";

interface PageResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(Sale.name) private readonly saleModel: Model<Sale>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(StockMovement.name)
    private readonly stockMovementModel: Model<StockMovement>,
  ) {}

  async create(
    request: SaleCreateDto,
    performedBy: string,
  ): Promise<SaleResponseDto> {
    const product = await this.productModel.findById(request.productId).exec();
    if (!product) {
      throw new NotFoundException("Product not found");
    }

    const qty = scaleQuantity(request.quantity) ?? 0;
    if (qty <= 0) {
      throw new BadRequestException("Quantity must be greater than zero");
    }

    const price = scalePrice(request.unitPrice);
    if (price === null || price <= 0) {
      throw new BadRequestException("Unit price must be greater than zero");
    }

    const saleDate = request.saleDate ? new Date(request.saleDate) : new Date();
    if (Number.isNaN(saleDate.getTime())) {
      throw new BadRequestException("Invalid sale date");
    }

    const currentQty = product.quantity ?? 0;
    const newQuantity = currentQty - qty;
    if (newQuantity < 0) {
      throw new BadRequestException("Stock quantity cannot be negative");
    }

    product.quantity = scaleQuantity(newQuantity);
    await product.save();

    const sale = await this.saleModel.create({
      productId: product.id,
      quantity: qty,
      unitPrice: price,
      saleDate,
      note: request.note ?? null,
      performedBy,
      createdAt: new Date(),
    });

    await this.stockMovementModel.create({
      productId: product.id,
      delta: -qty,
      reason: StockMovementReason.SALE,
      batchId: null,
      supplierId: null,
      unitCost: null,
      note: request.note ?? null,
      performedBy,
      createdAt: saleDate,
    });

    return this.toResponse(sale, product.name);
  }

  async getAll(
    page = 0,
    size = 20,
    productId?: string,
  ): Promise<PageResult<SaleResponseDto>> {
    const query: Record<string, unknown> = {};
    if (productId && productId.trim() !== "") {
      query.productId = productId;
    }

    const total = await this.saleModel.countDocuments(query);
    const sales = await this.saleModel
      .find(query)
      .sort({ saleDate: -1 })
      .skip(page * size)
      .limit(size)
      .exec();

    const productIds = Array.from(new Set(sales.map((sale) => sale.productId)));
    const products = await this.productModel
      .find({ _id: { $in: productIds } })
      .exec();
    const productMap = new Map(
      products.map((product) => [product.id, product.name]),
    );

    return {
      content: sales.map((sale) =>
        this.toResponse(sale, productMap.get(sale.productId) ?? null),
      ),
      totalElements: total,
      totalPages: Math.ceil(total / size),
      number: page,
      size,
    };
  }

  private toResponse(sale: Sale, productName: string | null): SaleResponseDto {
    return {
      id: sale.id,
      productId: sale.productId,
      productName,
      quantity: sale.quantity,
      unitPrice: sale.unitPrice,
      saleDate: sale.saleDate ? sale.saleDate.toISOString() : null,
      note: sale.note ?? null,
      performedBy: sale.performedBy ?? null,
      createdAt: sale.createdAt ? sale.createdAt.toISOString() : null,
    };
  }
}
