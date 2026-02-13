import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductSupplier } from '../schemas/product-supplier.schema';
import { ProductSupplierHistory } from '../schemas/product-supplier-history.schema';
import { ProductSupplierRequestDto } from './dto/product-supplier-request.dto';
import { ProductSupplierResponseDto } from './dto/product-supplier-response.dto';
import { ProductSupplierHistoryResponseDto } from './dto/product-supplier-history-response.dto';
import { Product } from '../schemas/product.schema';
import { Supplier } from '../schemas/supplier.schema';
import { scalePrice } from '../../common/utils/number-utils';

@Injectable()
export class ProductSuppliersService {
  constructor(
    @InjectModel(ProductSupplier.name)
    private readonly productSupplierModel: Model<ProductSupplier>,
    @InjectModel(ProductSupplierHistory.name)
    private readonly historyModel: Model<ProductSupplierHistory>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(Supplier.name) private readonly supplierModel: Model<Supplier>,
  ) {}

  async upsert(
    productId: string,
    request: ProductSupplierRequestDto,
    updatedBy: string,
  ): Promise<ProductSupplierResponseDto> {
    const product = await this.productModel.findById(productId).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const supplier = await this.supplierModel
      .findById(request.supplierId)
      .exec();
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    const existing = await this.productSupplierModel
      .findOne({ productId: product.id, supplierId: supplier.id })
      .exec();

    const now = new Date();
    const newPrice = scalePrice(request.negotiatedPrice);

    const priceChanged =
      !existing ||
      existing.negotiatedPrice === null ||
      existing.negotiatedPrice === undefined ||
      Number(existing.negotiatedPrice) !== Number(newPrice);

    const doc = existing ?? new this.productSupplierModel();
    doc.productId = product.id;
    doc.supplierId = supplier.id;
    doc.negotiatedPrice = newPrice;
    doc.note = request.note ?? null;
    doc.updatedAt = now;

    const saved = await doc.save();

    if (priceChanged) {
      await this.historyModel.create({
        productId: product.id,
        supplierId: supplier.id,
        negotiatedPrice: newPrice,
        note: request.note ?? null,
        updatedBy,
        effectiveAt: now,
      });
    }

    return this.toResponse(saved, supplier.name);
  }

  async getSuppliersForProduct(
    productId: string,
  ): Promise<ProductSupplierResponseDto[]> {
    const exists = await this.productModel.exists({ _id: productId });
    if (!exists) {
      throw new NotFoundException('Product not found');
    }

    const suppliers = await this.supplierModel.find().exec();
    const supplierMap = new Map(suppliers.map((s) => [s.id, s]));

    const links = await this.productSupplierModel.find({ productId }).exec();
    return links.map((item) =>
      this.toResponse(item, supplierMap.get(item.supplierId)?.name ?? '-'),
    );
  }

  async getHistoryForProduct(
    productId: string,
  ): Promise<ProductSupplierHistoryResponseDto[]> {
    const exists = await this.productModel.exists({ _id: productId });
    if (!exists) {
      throw new NotFoundException('Product not found');
    }

    const suppliers = await this.supplierModel.find().exec();
    const supplierMap = new Map(suppliers.map((s) => [s.id, s]));

    const history = await this.historyModel
      .find({ productId })
      .sort({ effectiveAt: -1 })
      .exec();

    return history.map((item) => ({
      id: item.id,
      productId: item.productId,
      supplierId: item.supplierId,
      supplierName: supplierMap.get(item.supplierId)?.name ?? '-',
      negotiatedPrice: item.negotiatedPrice ?? null,
      note: item.note ?? null,
      updatedBy: item.updatedBy ?? null,
      effectiveAt: item.effectiveAt ? item.effectiveAt.toISOString() : null,
    }));
  }

  async getProductsForSupplier(
    supplierId: string,
  ): Promise<ProductSupplierResponseDto[]> {
    const supplier = await this.supplierModel.findById(supplierId).exec();
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    const links = await this.productSupplierModel.find({ supplierId }).exec();
    return links.map((item) => this.toResponse(item, supplier.name));
  }

  private toResponse(
    item: ProductSupplier,
    supplierName: string,
  ): ProductSupplierResponseDto {
    return {
      id: item.id,
      productId: item.productId,
      supplierId: item.supplierId,
      supplierName,
      negotiatedPrice: item.negotiatedPrice ?? null,
      note: item.note ?? null,
      updatedAt: item.updatedAt ? item.updatedAt.toISOString() : null,
    };
  }
}
