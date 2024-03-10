import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BookService } from './book.service';
import { Book } from './schemas/book.schema';
import { CreateBookDto } from './dto/CreateBook.dto';
import { UpdateBookDto } from './dto/UpdateBookDto';
import { GetAllBooksQuery } from './queries/GetAllBooks.query';
import { AuthGuard } from '@nestjs/passport';

@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get()
  async getAllBooks(@Query() query: GetAllBooksQuery): Promise<Book[]> {
    return this.bookService.findAll(query);
  }

  @Get(':id')
  async getBookById(@Param('id') id: string): Promise<Book> {
    return this.bookService.findById(id);
  }

  @Post()
  @UseGuards(AuthGuard())
  async createBook(
    @Body() createBookDto: CreateBookDto,
    @Req() req,
  ): Promise<Book> {
    return this.bookService.createBook(createBookDto, req.user);
  }

  @Patch(':id')
  async updateBook(
    @Param('id') id: string,
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<Book> {
    return this.bookService.updateBook(id, updateBookDto);
  }

  @Delete(':id')
  async deleteBook(@Param('id') id: string): Promise<{ deleted: boolean }> {
    return this.bookService.deleteBook(id);
  }
}
