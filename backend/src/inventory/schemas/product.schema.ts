import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Unit } from '../enums/unit.enum';

@Schema({ collection: 'products', timestamps: false })
export class Product extends Document {
  @Prop({ required: true })
  name!: string;

  @Prop({ type: String, unique: true, sparse: true, index: true })
  barcode?: string | null;

  @Prop({ required: true, index: true })
  categoryId!: string;

  @Prop({ required: true })
  primarySupplierId!: string;

  @Prop({ type: Number })
  price!: number;

  @Prop({ type: Number })
  costPrice?: number | null;

  @Prop({ type: Number })
  quantity?: number | null;

  @Prop({ type: String, enum: Unit })
  unit!: Unit;

  @Prop({ type: String })
  imageUrl?: string | null;

  @Prop({ type: String })
  notes?: string | null;

  @Prop({ type: Number })
  lowStockThreshold?: number | null;

  @Prop({ type: Date })
  lowStockSnoozedUntil?: Date | null;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
