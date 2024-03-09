import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateBookDto {
  @IsString()
  @MaxLength(500)
  @IsOptional()
  readonly description?: string;

  @IsOptional()
  readonly author?: string;

  @IsOptional()
  readonly price?: number;
}
