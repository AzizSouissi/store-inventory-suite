import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'product_supplier_price_history', timestamps: false })
export class ProductSupplierHistory extends Document {
  @Prop({ required: true, index: true })
  productId!: string;

  @Prop({ required: true, index: true })
  supplierId!: string;

  @Prop({ type: Number })
  negotiatedPrice?: number | null;

  @Prop({ type: String })
  note?: string | null;

  @Prop({ type: String })
  updatedBy?: string | null;

  @Prop({ type: Date })
  effectiveAt?: Date | null;
}

export const ProductSupplierHistorySchema = SchemaFactory.createForClass(
  ProductSupplierHistory,
);
