import { IsOptional, IsString, MaxLength } from 'class-validator';
import { Category } from '../schemas/book.schema';

export class CreateBookDto {
  @IsString()
  @MaxLength(100)
  readonly title: string;

  @IsString()
  @MaxLength(500)
  readonly description: string;

  @IsOptional()
  readonly author?: string;

  @IsOptional()
  readonly price?: number;

  @IsOptional()
  readonly category?: Category;
}
