import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import type { Express } from "express";
import { Product } from "../schemas/product.schema";
import { Category } from "../schemas/category.schema";
import { Supplier } from "../schemas/supplier.schema";
import { ProductSupplier } from "../schemas/product-supplier.schema";
import { ProductSupplierHistory } from "../schemas/product-supplier-history.schema";
import { InventoryBatch } from "../schemas/inventory-batch.schema";
import { StockMovement } from "../schemas/stock-movement.schema";
import { ProductCreateDto } from "./dto/product-create.dto";
import { ProductUpdateDto } from "./dto/product-update.dto";
import { ProductResponseDto } from "./dto/product-response.dto";
import { ProductReorderResponseDto } from "./dto/product-reorder-response.dto";
import { ProductBulkCategoryDto } from "./dto/product-bulk-category.dto";
import { ProductBulkPriceDto } from "./dto/product-bulk-price.dto";
import { ProductImportResultDto } from "./dto/product-import-result.dto";
import { StockReceiveDto } from "./dto/stock-receive.dto";
import { StockWasteDto } from "./dto/stock-waste.dto";
import { StockAdjustDto } from "./dto/stock-adjust.dto";
import { BatchResponseDto } from "./dto/batch-response.dto";
import { StockMovementResponseDto } from "./dto/stock-movement-response.dto";
import { StockMovementReason } from "../enums/stock-movement-reason.enum";
import { Unit } from "../enums/unit.enum";
import {
  scalePrice,
  scaleQuantity,
  scaleThreshold,
} from "../../common/utils/number-utils";
import { parse } from "csv-parse/sync";

interface PageResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    @InjectModel(Supplier.name) private readonly supplierModel: Model<Supplier>,
    @InjectModel(ProductSupplier.name)
    private readonly productSupplierModel: Model<ProductSupplier>,
    @InjectModel(ProductSupplierHistory.name)
    private readonly productSupplierHistoryModel: Model<ProductSupplierHistory>,
    @InjectModel(InventoryBatch.name)
    private readonly inventoryBatchModel: Model<InventoryBatch>,
    @InjectModel(StockMovement.name)
    private readonly stockMovementModel: Model<StockMovement>,
  ) {}

  async create(request: ProductCreateDto): Promise<ProductResponseDto> {
    const name = request.name.trim();
    await this.ensureCategoryExists(request.categoryId);
    const supplier = await this.ensureSupplierExists(request.primarySupplierId);
    await this.ensureDuplicateProduct(name, request.categoryId, null);

    const barcode = this.normalizeBarcode(request.barcode ?? null);
    await this.ensureBarcodeUnique(barcode, null);

    const scaledPrice = scalePrice(request.price);
    if (scaledPrice === null) {
      throw new BadRequestException("Price is required");
    }

    const saved = await this.productModel.create({
      name,
      barcode,
      categoryId: request.categoryId,
      primarySupplierId: request.primarySupplierId,
      costPrice: null,
      price: scaledPrice,
      quantity: scaleQuantity(0),
      unit: request.unit,
      imageUrl: request.imageUrl ?? null,
      notes: request.notes ?? null,
      lowStockThreshold: scaleThreshold(request.lowStockThreshold),
      lowStockSnoozedUntil: null,
    });

    await this.upsertProductSupplier(
      saved.id,
      supplier,
      null,
      request.notes ?? null,
      "system",
    );
    return this.toResponse(saved);
  }

  async update(
    id: string,
    request: ProductUpdateDto,
  ): Promise<ProductResponseDto> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException("Product not found");
    }

    await this.ensureCategoryExists(request.categoryId);
    const supplier = await this.ensureSupplierExists(request.primarySupplierId);

    const newName = request.name.trim();
    if (
      product.name.toLowerCase() !== newName.toLowerCase() ||
      product.categoryId !== request.categoryId
    ) {
      await this.ensureDuplicateProduct(newName, request.categoryId, id);
    }

    const barcode = this.normalizeBarcode(request.barcode ?? null);
    await this.ensureBarcodeUnique(barcode, id);

    product.name = newName;
    product.barcode = barcode;
    product.categoryId = request.categoryId;
    product.primarySupplierId = request.primarySupplierId;
    const scaledPrice = scalePrice(request.price);
    if (scaledPrice === null) {
      throw new BadRequestException("Price is required");
    }
    product.price = scaledPrice;
    product.unit = request.unit;
    product.imageUrl = request.imageUrl ?? null;
    product.notes = request.notes ?? null;
    product.lowStockThreshold = scaleThreshold(request.lowStockThreshold);

    const saved = await product.save();
    await this.upsertProductSupplier(
      saved.id,
      supplier,
      null,
      request.notes ?? null,
      "system",
    );
    return this.toResponse(saved);
  }

  async delete(id: string): Promise<void> {
    const exists = await this.productModel.exists({ _id: id });
    if (!exists) {
      throw new NotFoundException("Product not found");
    }
    await this.productModel.deleteOne({ _id: id }).exec();
  }

  async getById(id: string): Promise<ProductResponseDto> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException("Product not found");
    }
    return this.toResponse(product);
  }

  async getByBarcode(barcode: string): Promise<ProductResponseDto> {
    const normalized = this.normalizeBarcode(barcode);
    if (!normalized) {
      throw new BadRequestException("Barcode is required");
    }
    const product = await this.productModel
      .findOne({ barcode: normalized })
      .exec();
    if (!product) {
      throw new NotFoundException("Product not found");
    }
    return this.toResponse(product);
  }

  async receiveStock(
    id: string,
    request: StockReceiveDto,
    performedBy: string,
  ): Promise<ProductResponseDto> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException("Product not found");
    }

    let supplierId = request.supplierId ?? null;
    if (!supplierId || supplierId.trim() === "") {
      supplierId = product.primarySupplierId;
    }
    const supplier = await this.ensureSupplierExists(supplierId);

    if (!request.costPrice || request.costPrice <= 0) {
      throw new BadRequestException(
        "Cost price is required for receiving stock",
      );
    }

    const delta = scaleQuantity(request.quantity) ?? 0;
    const currentQty = product.quantity ?? 0;
    const newQuantity = currentQty + delta;

    product.quantity = scaleQuantity(newQuantity);
    product.primarySupplierId = supplierId;
    product.costPrice = scalePrice(request.costPrice);

    const saved = await product.save();

    let lotNumber = request.lotNumber ?? null;
    if (!lotNumber || lotNumber.trim() === "") {
      lotNumber = await this.generateNextBatchNumber(id);
    }

    const batch = await this.inventoryBatchModel.create({
      productId: id,
      supplierId,
      lotNumber,
      expiryDate: request.expiryDate ? new Date(request.expiryDate) : null,
      unitCost: scalePrice(request.costPrice),
      quantityReceived: scaleQuantity(request.quantity),
      quantityRemaining: scaleQuantity(request.quantity),
      receivedAt: new Date(),
      note: request.note ?? null,
      createdBy: performedBy,
    });

    await this.stockMovementModel.create({
      productId: id,
      delta,
      reason: StockMovementReason.RECEIVE,
      batchId: batch.id,
      supplierId,
      unitCost: scalePrice(request.costPrice),
      note: request.note ?? null,
      performedBy,
      createdAt: new Date(),
    });

    await this.upsertProductSupplier(
      saved.id,
      supplier,
      request.costPrice,
      request.note ?? null,
      performedBy,
    );

    return this.toResponse(saved);
  }

  async wasteStock(
    id: string,
    request: StockWasteDto,
    performedBy: string,
  ): Promise<ProductResponseDto> {
    if (
      request.reason !== StockMovementReason.WASTE &&
      request.reason !== StockMovementReason.SPOILAGE
    ) {
      throw new BadRequestException("Invalid reason for waste stock");
    }

    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException("Product not found");
    }

    const batch = await this.inventoryBatchModel
      .findOne({ _id: request.batchId, productId: id })
      .exec();
    if (!batch) {
      throw new NotFoundException("Batch not found for product");
    }

    const wasteQty = scaleQuantity(request.quantity) ?? 0;
    const remaining = batch.quantityRemaining ?? 0;
    if (remaining < wasteQty) {
      throw new BadRequestException("Batch does not have enough quantity");
    }

    batch.quantityRemaining = scaleQuantity(remaining - wasteQty);
    await batch.save();

    const currentQty = product.quantity ?? 0;
    const newQuantity = currentQty - wasteQty;
    if (newQuantity < 0) {
      throw new BadRequestException("Stock quantity cannot be negative");
    }
    product.quantity = scaleQuantity(newQuantity);
    const saved = await product.save();

    await this.stockMovementModel.create({
      productId: id,
      delta: -wasteQty,
      reason: request.reason,
      batchId: batch.id,
      supplierId: batch.supplierId,
      unitCost: batch.unitCost ?? null,
      note: request.note ?? null,
      performedBy,
      createdAt: new Date(),
    });

    return this.toResponse(saved);
  }

  async adjustStock(
    id: string,
    request: StockAdjustDto,
    performedBy: string,
  ): Promise<ProductResponseDto> {
    if (request.reason === StockMovementReason.RECEIVE) {
      return this.applyStockMovement(
        id,
        request.quantity,
        request.reason,
        request.note ?? null,
        performedBy,
        true,
      );
    }
    if (
      request.reason === StockMovementReason.WASTE ||
      request.reason === StockMovementReason.SPOILAGE
    ) {
      return this.applyStockMovement(
        id,
        request.quantity,
        request.reason,
        request.note ?? null,
        performedBy,
        false,
      );
    }
    return this.applyStockMovement(
      id,
      request.quantity,
      request.reason,
      request.note ?? null,
      performedBy,
      request.increase,
    );
  }

  async getStockMovements(
    id: string,
    page = 0,
    size = 20,
  ): Promise<PageResult<StockMovementResponseDto>> {
    const total = await this.stockMovementModel.countDocuments({
      productId: id,
    });
    const movements = await this.stockMovementModel
      .find({ productId: id })
      .sort({ createdAt: -1 })
      .skip(page * size)
      .limit(size)
      .exec();

    return {
      content: movements.map((movement) => this.toMovementResponse(movement)),
      totalElements: total,
      totalPages: Math.ceil(total / size),
      number: page,
      size,
    };
  }

  async getBatches(
    id: string,
    availableOnly: boolean,
  ): Promise<BatchResponseDto[]> {
    const query = availableOnly
      ? { productId: id, quantityRemaining: { $gt: 0 } }
      : { productId: id };

    const batches = await this.inventoryBatchModel
      .find(query)
      .sort({ receivedAt: -1 })
      .exec();

    const suppliers = await this.supplierModel.find().exec();
    const supplierMap = new Map(
      suppliers.map((supplier) => [supplier.id, supplier]),
    );

    return batches.map((batch) => ({
      id: batch.id,
      productId: batch.productId,
      supplierId: batch.supplierId,
      supplierName: supplierMap.get(batch.supplierId)?.name ?? null,
      lotNumber: batch.lotNumber ?? null,
      expiryDate: batch.expiryDate ? batch.expiryDate.toISOString() : null,
      unitCost: batch.unitCost ?? null,
      quantityReceived: batch.quantityReceived ?? null,
      quantityRemaining: batch.quantityRemaining ?? null,
      receivedAt: batch.receivedAt ? batch.receivedAt.toISOString() : null,
      note: batch.note ?? null,
    }));
  }

  async getAll(
    page = 0,
    size = 20,
    sortBy = "name",
    sortDir = "asc",
    name?: string,
    categoryId?: string,
    supplierId?: string,
  ): Promise<PageResult<ProductResponseDto>> {
    const nameValue = name?.trim() ?? "";
    const hasName = nameValue !== "";
    const hasCategory = !!categoryId && categoryId.trim() !== "";
    const hasSupplier = !!supplierId && supplierId.trim() !== "";

    if (hasSupplier) {
      const links = await this.productSupplierModel.find({ supplierId }).exec();
      const productIds = Array.from(
        new Set(links.map((link) => link.productId)),
      );
      if (productIds.length === 0) {
        return {
          content: [],
          totalElements: 0,
          totalPages: 0,
          number: page,
          size,
        };
      }

      const products = await this.productModel
        .find({ _id: { $in: productIds } })
        .exec();
      const filtered = products
        .filter(
          (product) =>
            !hasName ||
            product.name.toLowerCase().includes(nameValue.toLowerCase()),
        )
        .filter((product) => !hasCategory || product.categoryId === categoryId);

      const start = page * size;
      const end = Math.min(start + size, filtered.length);
      const content =
        start >= filtered.length ? [] : filtered.slice(start, end);

      return {
        content: content.map((product) => this.toResponse(product)),
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / size),
        number: page,
        size,
      };
    }

    const query: Record<string, unknown> = {};
    if (hasName) {
      query.name = { $regex: nameValue, $options: "i" };
    }
    if (hasCategory) {
      query.categoryId = categoryId;
    }

    const direction = sortDir?.toLowerCase() === "desc" ? -1 : 1;
    const total = await this.productModel.countDocuments(query);
    const products = await this.productModel
      .find(query)
      .sort({ [sortBy]: direction })
      .skip(page * size)
      .limit(size)
      .exec();

    return {
      content: products.map((product) => this.toResponse(product)),
      totalElements: total,
      totalPages: Math.ceil(total / size),
      number: page,
      size,
    };
  }

  async getLowStockAlerts(): Promise<ProductResponseDto[]> {
    const categories = await this.categoryModel.find().exec();
    const categoryMap = new Map(
      categories.map((category) => [category.id, category]),
    );
    const now = new Date();

    const products = await this.productModel.find().exec();
    return products
      .filter((product) => this.isLowStock(product, categoryMap, now))
      .map((product) => this.toResponse(product));
  }

  async getReorderList(): Promise<ProductReorderResponseDto[]> {
    const categories = await this.categoryModel.find().exec();
    const categoryMap = new Map(
      categories.map((category) => [category.id, category]),
    );
    const now = new Date();

    const products = await this.productModel.find().exec();
    return products
      .filter((product) => this.isLowStock(product, categoryMap, now))
      .map((product) => {
        const threshold = this.resolveThreshold(product, categoryMap);
        const currentQty = product.quantity ?? 0;
        let suggested = threshold ? threshold - currentQty : 0;
        if (suggested < 0) {
          suggested = 0;
        }
        return {
          id: product.id,
          name: product.name,
          categoryId: product.categoryId,
          unit: product.unit,
          quantity: product.quantity ?? null,
          lowStockThreshold: threshold ?? null,
          suggestedOrderQuantity: scaleQuantity(suggested) ?? 0,
        };
      });
  }

  async snoozeLowStock(id: string, until: Date): Promise<void> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException("Product not found");
    }
    product.lowStockSnoozedUntil = until;
    await product.save();
  }

  async bulkUpdateCategory(request: ProductBulkCategoryDto): Promise<void> {
    await this.ensureCategoryExists(request.categoryId);
    const products = await this.productModel
      .find({ _id: { $in: request.productIds } })
      .exec();
    for (const product of products) {
      if (product.categoryId !== request.categoryId) {
        await this.ensureDuplicateProduct(
          product.name,
          request.categoryId,
          product.id,
        );
        product.categoryId = request.categoryId;
      }
    }
    if (products.length > 0) {
      await this.productModel.bulkSave(products);
    }
  }

  async bulkUpdatePrice(request: ProductBulkPriceDto): Promise<void> {
    const price = scalePrice(request.price);
    await this.productModel.updateMany(
      { _id: { $in: request.productIds } },
      { $set: { price } },
    );
  }

  async importCsv(file: Express.Multer.File): Promise<ProductImportResultDto> {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestException("CSV file is required");
    }

    const records = parse(file.buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Record<string, string>[];

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const record of records) {
      const name = this.safeValue(record, "name");
      const barcode = this.normalizeBarcode(this.safeValue(record, "barcode"));
      const categoryId = this.safeValue(record, "categoryId");
      const primarySupplierId = this.safeValue(record, "primarySupplierId");
      const unitRaw = this.safeValue(record, "unit");
      const price = this.parseNumber(record, "price");

      if (
        !name ||
        !categoryId ||
        !unitRaw ||
        !primarySupplierId ||
        price === null
      ) {
        skipped++;
        continue;
      }

      const category = await this.ensureCategoryExists(categoryId);
      const supplier = await this.ensureSupplierExists(primarySupplierId);

      let product = await this.resolveExistingProduct(
        name,
        categoryId,
        barcode,
      );
      const isNew = !product;

      if (!product) {
        product = new this.productModel();
      }

      product.name = name.trim();
      product.barcode = barcode;
      product.categoryId = categoryId;
      product.primarySupplierId = primarySupplierId;
      product.unit = this.parseUnit(unitRaw);
      product.costPrice = scalePrice(this.parseNumber(record, "costPrice"));
      const scaledPrice = scalePrice(price);
      if (scaledPrice === null) {
        throw new BadRequestException("Price is required");
      }
      product.price = scaledPrice;
      product.quantity = scaleQuantity(
        this.parseNumber(record, "quantity") ?? 0,
      );
      product.imageUrl = this.safeValue(record, "imageUrl");
      product.notes = this.safeValue(record, "notes");

      let threshold = this.parseNumber(record, "lowStockThreshold");
      if (
        threshold === null &&
        category.defaultLowStockThreshold !== undefined
      ) {
        threshold = category.defaultLowStockThreshold ?? null;
      }
      product.lowStockThreshold = scaleThreshold(threshold);

      const saved = await product.save();
      await this.upsertProductSupplier(
        saved.id,
        supplier,
        saved.costPrice ?? null,
        saved.notes ?? null,
        "import",
      );

      if (isNew) {
        created++;
      } else {
        updated++;
      }
    }

    return { created, updated, skipped };
  }

  private async applyStockMovement(
    productId: string,
    quantity: number,
    reason: StockMovementReason,
    note: string | null,
    performedBy: string,
    increase: boolean,
  ): Promise<ProductResponseDto> {
    const product = await this.productModel.findById(productId).exec();
    if (!product) {
      throw new NotFoundException("Product not found");
    }

    let delta = scaleQuantity(quantity) ?? 0;
    if (!increase) {
      delta = -delta;
    }

    const currentQty = product.quantity ?? 0;
    const newQuantity = currentQty + delta;
    if (newQuantity < 0) {
      throw new BadRequestException("Stock quantity cannot be negative");
    }

    product.quantity = scaleQuantity(newQuantity);
    const saved = await product.save();

    await this.stockMovementModel.create({
      productId,
      delta,
      reason,
      batchId: null,
      supplierId: null,
      unitCost: null,
      note: note ?? null,
      performedBy,
      createdAt: new Date(),
    });

    return this.toResponse(saved);
  }

  private async ensureCategoryExists(categoryId: string): Promise<Category> {
    const category = await this.categoryModel.findById(categoryId).exec();
    if (!category) {
      throw new NotFoundException("Category not found");
    }
    return category;
  }

  private async ensureSupplierExists(supplierId: string): Promise<Supplier> {
    if (!supplierId || supplierId.trim() === "") {
      throw new BadRequestException("Supplier is required");
    }
    const supplier = await this.supplierModel.findById(supplierId).exec();
    if (!supplier) {
      throw new NotFoundException("Supplier not found");
    }
    return supplier;
  }

  private async ensureDuplicateProduct(
    name: string,
    categoryId: string,
    currentProductId: string | null,
  ): Promise<void> {
    const existing = await this.productModel
      .findOne({ name: new RegExp(`^${name}$`, "i"), categoryId })
      .exec();

    if (!existing) {
      return;
    }
    if (!currentProductId || existing.id !== currentProductId) {
      throw new BadRequestException(
        "A product with the same name already exists in this category",
      );
    }
  }

  private async ensureBarcodeUnique(
    barcode: string | null,
    currentProductId: string | null,
  ): Promise<void> {
    if (!barcode) {
      return;
    }
    const existing = await this.productModel.findOne({ barcode }).exec();
    if (existing && (!currentProductId || existing.id !== currentProductId)) {
      throw new BadRequestException(
        "Barcode already assigned to another product",
      );
    }
  }

  private normalizeBarcode(barcode: string | null | undefined): string | null {
    if (barcode === null || barcode === undefined) {
      return null;
    }
    const trimmed = barcode.trim();
    return trimmed === "" ? null : trimmed;
  }

  private toResponse(product: Product): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      barcode: product.barcode ?? null,
      categoryId: product.categoryId,
      primarySupplierId: product.primarySupplierId,
      costPrice: product.costPrice ?? null,
      price: product.price,
      quantity: product.quantity ?? null,
      unit: product.unit,
      imageUrl: product.imageUrl ?? null,
      notes: product.notes ?? null,
      lowStockThreshold: product.lowStockThreshold ?? null,
      lowStockSnoozedUntil: product.lowStockSnoozedUntil
        ? product.lowStockSnoozedUntil.toISOString()
        : null,
    };
  }

  private toMovementResponse(
    movement: StockMovement,
  ): StockMovementResponseDto {
    return {
      id: movement.id,
      productId: movement.productId,
      delta: movement.delta,
      reason: movement.reason,
      batchId: movement.batchId ?? null,
      supplierId: movement.supplierId ?? null,
      unitCost: movement.unitCost ?? null,
      note: movement.note ?? null,
      performedBy: movement.performedBy ?? null,
      createdAt: movement.createdAt ? movement.createdAt.toISOString() : null,
    };
  }

  private isLowStock(
    product: Product,
    categoryMap: Map<string, Category>,
    now: Date,
  ): boolean {
    if (product.lowStockSnoozedUntil && product.lowStockSnoozedUntil > now) {
      return false;
    }
    const threshold = this.resolveThreshold(product, categoryMap);
    if (threshold === null || threshold === undefined) {
      return false;
    }
    const currentQty = product.quantity ?? 0;
    return currentQty < threshold;
  }

  private resolveThreshold(
    product: Product,
    categoryMap: Map<string, Category>,
  ): number | null {
    if (
      product.lowStockThreshold !== null &&
      product.lowStockThreshold !== undefined
    ) {
      return product.lowStockThreshold;
    }
    const category = categoryMap.get(product.categoryId);
    return category?.defaultLowStockThreshold ?? null;
  }

  private async upsertProductSupplier(
    productId: string,
    supplier: Supplier | null,
    price: number | null,
    note: string | null,
    updatedBy: string,
  ): Promise<void> {
    if (!supplier) {
      return;
    }

    const existing = await this.productSupplierModel
      .findOne({ productId, supplierId: supplier.id })
      .exec();

    const scaledPrice =
      price === null || price === undefined ? null : scalePrice(price);
    const priceChanged =
      scaledPrice !== null &&
      (!existing ||
        existing.negotiatedPrice === null ||
        existing.negotiatedPrice === undefined ||
        Number(existing.negotiatedPrice) !== Number(scaledPrice));

    const doc = existing ?? new this.productSupplierModel();
    doc.productId = productId;
    doc.supplierId = supplier.id;
    doc.negotiatedPrice = scaledPrice;
    doc.note = note ?? null;
    doc.updatedAt = new Date();
    const saved = await doc.save();

    if (priceChanged) {
      await this.productSupplierHistoryModel.create({
        productId: saved.productId,
        supplierId: saved.supplierId,
        negotiatedPrice: saved.negotiatedPrice,
        note: note ?? null,
        updatedBy,
        effectiveAt: new Date(),
      });
    }
  }

  private safeValue(
    record: Record<string, string>,
    key: string,
  ): string | null {
    if (record && Object.prototype.hasOwnProperty.call(record, key)) {
      const value = record[key];
      if (value === undefined || value === null) {
        return null;
      }
      const trimmed = String(value).trim();
      return trimmed === "" ? null : trimmed;
    }
    return null;
  }

  private parseNumber(
    record: Record<string, string>,
    key: string,
  ): number | null {
    const value = this.safeValue(record, key);
    if (value === null) {
      return null;
    }
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      return null;
    }
    return parsed;
  }

  private async resolveExistingProduct(
    name: string,
    categoryId: string,
    barcode: string | null,
  ): Promise<Product | null> {
    if (barcode) {
      return this.productModel.findOne({ barcode }).exec();
    }
    return this.productModel
      .findOne({ name: new RegExp(`^${name}$`, "i"), categoryId })
      .exec();
  }

  private parseUnit(value: string): Unit {
    const normalized = value.trim().toUpperCase();
    if (!this.isUnit(normalized)) {
      throw new BadRequestException(`Invalid unit: ${value}`);
    }
    return normalized;
  }

  private isUnit(value: string): value is Unit {
    const unitValues = Object.values(Unit) as string[];
    return unitValues.includes(value);
  }

  private async generateNextBatchNumber(productId: string): Promise<string> {
    const latest = await this.inventoryBatchModel
      .findOne({ productId })
      .sort({ receivedAt: -1 })
      .exec();

    const current = latest?.lotNumber
      ? this.parseLotNumber(latest.lotNumber)
      : null;
    if (current === null) {
      return "1";
    }
    return String(current + 1);
  }

  private parseLotNumber(value: string): number | null {
    if (!value) {
      return null;
    }
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    const parsed = Number(trimmed);
    if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
      return null;
    }
    return Math.trunc(parsed);
  }
}
