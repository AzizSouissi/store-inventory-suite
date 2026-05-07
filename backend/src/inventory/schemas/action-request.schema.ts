import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RequestStatus } from '../requests/enums/request-status.enum';
import { RequestType } from '../requests/enums/request-type.enum';

@Schema({ collection: 'action_requests', timestamps: false })
export class ActionRequest extends Document {
  @Prop({ type: String, enum: RequestType, required: true })
  type!: RequestType;

  @Prop({ type: String, enum: RequestStatus, required: true })
  status!: RequestStatus;

  @Prop({ type: String, index: true })
  productId?: string | null;

  @Prop({ type: Object })
  payload?: Record<string, unknown> | null;

  @Prop({ type: String, required: true, index: true })
  createdBy!: string;

  @Prop({ type: Date, required: true })
  createdAt!: Date;

  @Prop({ type: String })
  reviewedBy?: string | null;

  @Prop({ type: Date })
  reviewedAt?: Date | null;

  @Prop({ type: String })
  reviewNote?: string | null;
}

export const ActionRequestSchema = SchemaFactory.createForClass(ActionRequest);
