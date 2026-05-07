import { RequestStatus } from '../enums/request-status.enum';
import { RequestType } from '../enums/request-type.enum';

export class RequestResponseDto {
  id!: string;
  type!: RequestType;
  status!: RequestStatus;
  productId?: string | null;
  payload?: Record<string, unknown> | null;
  createdBy!: string;
  createdAt?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  reviewNote?: string | null;
}
