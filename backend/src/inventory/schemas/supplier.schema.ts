import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'suppliers', timestamps: false })
export class Supplier extends Document {
  @Prop({ required: true, unique: true, index: true })
  name!: string;

  @Prop({ type: String })
  phone?: string | null;

  @Prop({ type: String })
  address?: string | null;

  @Prop({ type: String })
  notes?: string | null;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);
