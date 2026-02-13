import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'inventory_batches', timestamps: false })
export class InventoryBatch extends Document {
  @Prop({ required: true, index: true })
  productId!: string;

  @Prop({ required: true, index: true })
  supplierId!: string;

  @Prop({ type: String })
  lotNumber?: string | null;

  @Prop({ type: Date })
  expiryDate?: Date | null;

  @Prop({ type: Number })
  unitCost?: number | null;

  @Prop({ type: Number })
  quantityReceived?: number | null;

  @Prop({ type: Number })
  quantityRemaining?: number | null;

  @Prop({ type: Date })
  receivedAt?: Date | null;

  @Prop({ type: String })
  note?: string | null;

  @Prop({ type: String })
  createdBy?: string | null;
}

export const InventoryBatchSchema =
  SchemaFactory.createForClass(InventoryBatch);
