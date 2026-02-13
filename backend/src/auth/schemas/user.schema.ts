import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../roles.enum';

@Schema({ collection: 'users', timestamps: false })
export class AppUser extends Document {
  @Prop({ required: true, unique: true, index: true })
  username!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ type: [String], enum: Role, default: [] })
  roles!: Role[];
}

export const AppUserSchema = SchemaFactory.createForClass(AppUser);
