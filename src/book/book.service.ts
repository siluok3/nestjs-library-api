import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Book } from './schemas/book.schema';
import { Model } from 'mongoose';
import { CreateBookDto } from './dto/CreateBook.dto';
import { UpdateBookDto } from './dto/UpdateBookDto';

@Injectable()
export class BookService {
  constructor(
    @InjectModel(Book.name) private readonly bookModel: Model<Book>,
  ) {}

  async findAll(): Promise<Book[]> {
    return await this.bookModel.find();
  }

  async findById(id: string): Promise<Book> {
    const book = await this.bookModel.findById(id);

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    return book;
  }

  async createBook(createBookDto: CreateBookDto): Promise<Book> {
    return this.bookModel.create(createBookDto);
  }

  async updateBook(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    const { description, price, author } = updateBookDto;
    const book = await this.bookModel.findByIdAndUpdate(
      id,
      { description: description, price: price, author: author },
      { new: true, runValidators: true },
    );

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    return book;
  }

  async deleteBook(id: string): Promise<Book> {
    return await this.bookModel.findByIdAndDelete(id);
  }
}
