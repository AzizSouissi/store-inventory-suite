import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'product_suppliers', timestamps: false })
export class ProductSupplier extends Document {
  @Prop({ required: true, index: true })
  productId!: string;

  @Prop({ required: true, index: true })
  supplierId!: string;

  @Prop({ type: Number })
  negotiatedPrice?: number | null;

  @Prop({ type: String })
  note?: string | null;

  @Prop({ type: Date })
  updatedAt?: Date | null;
}

export const ProductSupplierSchema =
  SchemaFactory.createForClass(ProductSupplier);
ProductSupplierSchema.index({ productId: 1, supplierId: 1 }, { unique: true });
