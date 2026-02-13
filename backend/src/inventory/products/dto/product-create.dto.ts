import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Unit } from '../../enums/unit.enum';

export class ProductCreateDto {
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @MaxLength(128)
  barcode?: string | null;

  @IsNotEmpty()
  categoryId!: string;

  @IsNotEmpty()
  primarySupplierId!: string;

  @IsNumber()
  @Min(0)
  @Max(1000000)
  price!: number;

  @IsNotEmpty()
  unit!: Unit;

  @IsOptional()
  @MaxLength(2048)
  imageUrl?: string | null;

  @IsOptional()
  @MaxLength(5000)
  notes?: string | null;

  @IsNumber()
  @Min(0)
  @Max(1000000)
  lowStockThreshold!: number;
}
