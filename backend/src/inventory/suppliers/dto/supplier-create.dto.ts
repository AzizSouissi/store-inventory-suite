import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class SupplierCreateDto {
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @MaxLength(50)
  phone?: string | null;

  @IsOptional()
  @MaxLength(500)
  address?: string | null;

  @IsOptional()
  @MaxLength(1000)
  notes?: string | null;
}
