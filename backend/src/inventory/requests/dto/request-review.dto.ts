import { IsOptional, MaxLength } from 'class-validator';

export class RequestReviewDto {
  @IsOptional()
  @MaxLength(2000)
  reviewNote?: string | null;
}
