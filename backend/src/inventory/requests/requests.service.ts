import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActionRequest } from '../schemas/action-request.schema';
import { RequestType } from './enums/request-type.enum';
import { RequestStatus } from './enums/request-status.enum';
import { RestockRequestDto } from './dto/restock-request.dto';
import { DamageReportDto } from './dto/damage-report.dto';
import { ProductSuggestionDto } from './dto/product-suggestion.dto';
import { ProductNoteDto } from './dto/product-note.dto';
import { RequestResponseDto } from './dto/request-response.dto';
import { ProductsService } from '../products/products.service';
import { StockReceiveDto } from '../products/dto/stock-receive.dto';
import { StockWasteDto } from '../products/dto/stock-waste.dto';
import { ProductCreateDto } from '../products/dto/product-create.dto';
import { Product } from '../schemas/product.schema';
import { StockMovementReason } from '../enums/stock-movement-reason.enum';

interface PageResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

interface RestockPayload {
  quantity: number;
  supplierId?: string | null;
  costPrice?: number | null;
  lotNumber?: string | null;
  expiryDate?: string | null;
  note?: string | null;
}

interface DamagePayload {
  batchId: string;
  quantity: number;
  reason: StockMovementReason;
  note?: string | null;
}

interface ProductNotePayload {
  note: string;
}

@Injectable()
export class RequestsService {
  constructor(
    @InjectModel(ActionRequest.name)
    private readonly requestModel: Model<ActionRequest>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    private readonly productsService: ProductsService,
  ) {}

  async createRestockRequest(
    request: RestockRequestDto,
    createdBy: string,
  ): Promise<RequestResponseDto> {
    await this.ensureProductExists(request.productId);
    return this.createRequest(
      RequestType.RESTOCK_REQUEST,
      request.productId,
      {
        quantity: request.quantity,
        supplierId: request.supplierId ?? null,
        costPrice: request.costPrice ?? null,
        lotNumber: request.lotNumber ?? null,
        expiryDate: request.expiryDate ?? null,
        note: request.note ?? null,
      },
      createdBy,
      request.draft === true,
    );
  }

  async createDamageReport(
    request: DamageReportDto,
    createdBy: string,
  ): Promise<RequestResponseDto> {
    await this.ensureProductExists(request.productId);
    return this.createRequest(
      RequestType.DAMAGE_REPORT,
      request.productId,
      {
        batchId: request.batchId,
        quantity: request.quantity,
        reason: request.reason,
        note: request.note ?? null,
      },
      createdBy,
      request.draft === true,
    );
  }

  async createProductSuggestion(
    request: ProductSuggestionDto,
    createdBy: string,
  ): Promise<RequestResponseDto> {
    return this.createRequest(
      RequestType.PRODUCT_SUGGESTION,
      null,
      {
        name: request.name,
        barcode: request.barcode ?? null,
        categoryId: request.categoryId,
        primarySupplierId: request.primarySupplierId,
        price: request.price,
        unit: request.unit,
        imageUrl: request.imageUrl ?? null,
        notes: request.notes ?? null,
        lowStockThreshold: request.lowStockThreshold,
      },
      createdBy,
      request.draft === true,
    );
  }

  async createProductNote(
    request: ProductNoteDto,
    createdBy: string,
  ): Promise<RequestResponseDto> {
    await this.ensureProductExists(request.productId);
    return this.createRequest(
      RequestType.PRODUCT_NOTE,
      request.productId,
      {
        note: request.note,
      },
      createdBy,
      request.draft === true,
    );
  }

  async getAll(
    page: number,
    size: number,
    filters: {
      status?: RequestStatus;
      type?: RequestType;
      productId?: string;
    },
    createdBy: string,
    isAdmin: boolean,
  ): Promise<PageResult<RequestResponseDto>> {
    const query: Record<string, unknown> = {};
    if (filters.status) query.status = filters.status;
    if (filters.type) query.type = filters.type;
    if (filters.productId) query.productId = filters.productId;
    if (!isAdmin) query.createdBy = createdBy;

    const total = await this.requestModel.countDocuments(query);
    const requests = await this.requestModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(page * size)
      .limit(size)
      .exec();

    return {
      content: requests.map((request) => this.toResponse(request)),
      totalElements: total,
      totalPages: Math.ceil(total / size),
      number: page,
      size,
    };
  }

  async submitRequest(
    id: string,
    submittedBy: string,
    isAdmin: boolean,
  ): Promise<RequestResponseDto> {
    const request = await this.findRequestForUser(id, submittedBy, isAdmin);
    if (request.status !== RequestStatus.DRAFT) {
      throw new BadRequestException('Only draft requests can be submitted');
    }

    request.status = RequestStatus.SUBMITTED;
    const saved = await request.save();
    return this.toResponse(saved);
  }

  async approveRequest(
    id: string,
    reviewedBy: string,
    reviewNote?: string | null,
  ): Promise<RequestResponseDto> {
    const request = await this.requestModel.findById(id).exec();
    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.status !== RequestStatus.SUBMITTED) {
      throw new BadRequestException('Only submitted requests can be approved');
    }

    await this.applyApproval(request, reviewedBy);

    request.status = RequestStatus.APPROVED;
    request.reviewedBy = reviewedBy;
    request.reviewedAt = new Date();
    request.reviewNote = reviewNote ?? null;

    const saved = await request.save();
    return this.toResponse(saved);
  }

  async rejectRequest(
    id: string,
    reviewedBy: string,
    reviewNote?: string | null,
  ): Promise<RequestResponseDto> {
    const request = await this.requestModel.findById(id).exec();
    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.status !== RequestStatus.SUBMITTED) {
      throw new BadRequestException('Only submitted requests can be rejected');
    }

    request.status = RequestStatus.REJECTED;
    request.reviewedBy = reviewedBy;
    request.reviewedAt = new Date();
    request.reviewNote = reviewNote ?? null;

    const saved = await request.save();
    return this.toResponse(saved);
  }

  private async createRequest(
    type: RequestType,
    productId: string | null,
    payload: Record<string, unknown>,
    createdBy: string,
    isDraft: boolean,
  ): Promise<RequestResponseDto> {
    const status = isDraft ? RequestStatus.DRAFT : RequestStatus.SUBMITTED;
    const created = await this.requestModel.create({
      type,
      status,
      productId,
      payload,
      createdBy,
      createdAt: new Date(),
    });

    return this.toResponse(created);
  }

  private async ensureProductExists(productId: string): Promise<void> {
    const exists = await this.productModel.exists({ _id: productId });
    if (!exists) {
      throw new NotFoundException('Product not found');
    }
  }

  private async findRequestForUser(
    id: string,
    username: string,
    isAdmin: boolean,
  ): Promise<ActionRequest> {
    const request = await this.requestModel.findById(id).exec();
    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (!isAdmin && request.createdBy !== username) {
      throw new ForbiddenException('Request is not accessible');
    }

    return request;
  }

  private getPayload<T>(request: ActionRequest): T {
    const payload = request.payload as T | null | undefined;
    if (!payload) {
      throw new BadRequestException('Request payload is missing');
    }
    return payload;
  }

  private async applyApproval(
    request: ActionRequest,
    reviewedBy: string,
  ): Promise<void> {
    switch (request.type) {
      case RequestType.RESTOCK_REQUEST:
        await this.applyRestock(request, reviewedBy);
        return;
      case RequestType.DAMAGE_REPORT:
        await this.applyDamageReport(request, reviewedBy);
        return;
      case RequestType.PRODUCT_SUGGESTION:
        await this.applyProductSuggestion(request);
        return;
      case RequestType.PRODUCT_NOTE:
        await this.applyProductNote(request);
        return;
      default:
        throw new BadRequestException('Unsupported request type');
    }
  }

  private async applyRestock(
    request: ActionRequest,
    reviewedBy: string,
  ): Promise<void> {
    if (!request.productId) {
      throw new BadRequestException('Product is required for restock');
    }

    const payload = this.getPayload<RestockPayload>(request);
    const product = await this.productModel.findById(request.productId).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const costPrice = payload.costPrice ?? product.costPrice ?? null;
    if (!costPrice || costPrice <= 0) {
      throw new BadRequestException(
        'Cost price is required to approve this restock request',
      );
    }

    const dto: StockReceiveDto = {
      quantity: payload.quantity,
      costPrice,
    };

    if (payload.supplierId) {
      dto.supplierId = payload.supplierId;
    }
    if (payload.lotNumber) {
      dto.lotNumber = payload.lotNumber;
    }
    if (payload.expiryDate) {
      dto.expiryDate = payload.expiryDate;
    }
    if (payload.note) {
      dto.note = payload.note;
    }

    await this.productsService.receiveStock(
      request.productId,
      dto,
      reviewedBy,
    );
  }

  private async applyDamageReport(
    request: ActionRequest,
    reviewedBy: string,
  ): Promise<void> {
    if (!request.productId) {
      throw new BadRequestException('Product is required for damage reports');
    }

    const payload = this.getPayload<DamagePayload>(request);
    const dto: StockWasteDto = {
      batchId: payload.batchId,
      quantity: payload.quantity,
      reason: payload.reason,
    };

    if (payload.note) {
      dto.note = payload.note;
    }

    await this.productsService.wasteStock(request.productId, dto, reviewedBy);
  }

  private async applyProductSuggestion(request: ActionRequest): Promise<void> {
    const payload = this.getPayload<ProductCreateDto>(request);
    await this.productsService.create(payload);
  }

  private async applyProductNote(request: ActionRequest): Promise<void> {
    if (!request.productId) {
      throw new BadRequestException('Product is required for product notes');
    }

    const payload = this.getPayload<ProductNotePayload>(request);
    const note = payload.note?.trim();
    if (!note) {
      throw new BadRequestException('Note is required');
    }

    const product = await this.productModel.findById(request.productId).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const prefix = `Staff note (${request.createdBy}): ${note}`;
    product.notes = product.notes ? `${product.notes}\n${prefix}` : prefix;
    await product.save();
  }

  private toResponse(request: ActionRequest): RequestResponseDto {
    return {
      id: request.id,
      type: request.type,
      status: request.status,
      productId: request.productId ?? null,
      payload: request.payload ?? null,
      createdBy: request.createdBy,
      createdAt: request.createdAt ? request.createdAt.toISOString() : null,
      reviewedBy: request.reviewedBy ?? null,
      reviewedAt: request.reviewedAt ? request.reviewedAt.toISOString() : null,
      reviewNote: request.reviewNote ?? null,
    };
  }
}
