import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, MaxLength } from "class-validator";

export class SupplierUpdateDto {
  @ApiProperty({ example: "Acme Supplies" })
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({ example: "+1 555 0100" })
  @IsOptional()
  @MaxLength(50)
  phone?: string | null;

  @ApiPropertyOptional({ example: "12 Market Street" })
  @IsOptional()
  @MaxLength(500)
  address?: string | null;

  @ApiPropertyOptional({ example: "Preferred vendor", maxLength: 1000 })
  @IsOptional()
  @MaxLength(1000)
  notes?: string | null;
}
