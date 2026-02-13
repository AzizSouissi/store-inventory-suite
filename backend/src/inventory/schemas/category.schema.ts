import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'categories', timestamps: false })
export class Category extends Document {
  @Prop({ required: true, unique: true, index: true })
  name: string;

  @Prop({ type: Number })
  defaultLowStockThreshold?: number | null;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
