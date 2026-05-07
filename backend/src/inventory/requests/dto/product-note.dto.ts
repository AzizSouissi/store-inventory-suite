import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class ProductNoteDto {
  @IsNotEmpty()
  productId!: string;

  @IsNotEmpty()
  @MaxLength(2000)
  note!: string;

  @IsOptional()
  @IsBoolean()
  draft?: boolean;
}
