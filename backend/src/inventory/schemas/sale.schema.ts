import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ collection: "sales", timestamps: false })
export class Sale extends Document {
  @Prop({ required: true, index: true })
  productId!: string;

  @Prop({ type: Number, required: true })
  quantity!: number;

  @Prop({ type: Number, required: true })
  unitPrice!: number;

  @Prop({ type: Date, required: true })
  saleDate!: Date;

  @Prop({ type: String })
  note?: string | null;

  @Prop({ type: String })
  performedBy?: string | null;

  @Prop({ type: Date })
  createdAt?: Date | null;
}

export const SaleSchema = SchemaFactory.createForClass(Sale);
