import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { StockMovementReason } from '../enums/stock-movement-reason.enum';

@Schema({ collection: 'stock_movements', timestamps: false })
export class StockMovement extends Document {
  @Prop({ required: true, index: true })
  productId!: string;

  @Prop({ type: Number, required: true })
  delta!: number;

  @Prop({ type: String, enum: StockMovementReason, required: true })
  reason!: StockMovementReason;

  @Prop({ type: String })
  batchId?: string | null;

  @Prop({ type: String })
  supplierId?: string | null;

  @Prop({ type: Number })
  unitCost?: number | null;

  @Prop({ type: String })
  note?: string | null;

  @Prop({ type: String })
  performedBy?: string | null;

  @Prop({ type: Date })
  createdAt?: Date | null;
}

export const StockMovementSchema = SchemaFactory.createForClass(StockMovement);
