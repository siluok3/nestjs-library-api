import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Category } from '../schemas/book.schema';

export class CreateBookDto {
  @IsString()
  @MaxLength(100)
  readonly title: string;

  @IsString()
  @MaxLength(500)
  readonly description: string;

  @IsString()
  @IsOptional()
  readonly author?: string;

  @IsNumber()
  @IsOptional()
  readonly price?: number;

  @IsOptional()
  @IsEnum(Category, {
    message: 'Add a valid category from adventure, classics, crime, fantasy',
  })
  readonly category?: Category;
}
