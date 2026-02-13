import { IsNotEmpty } from 'class-validator';

export class LoginRequestDto {
  @IsNotEmpty()
  username!: string;

  @IsNotEmpty()
  password!: string;
}
