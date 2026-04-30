import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class LoginRequestDto {
  @ApiProperty({ example: "admin" })
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ example: "secret-password" })
  @IsNotEmpty()
  password!: string;
}
