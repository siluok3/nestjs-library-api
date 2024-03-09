import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Book } from './schemas/book.schema';
import mongoose, { Model } from 'mongoose';
import { CreateBookDto } from './dto/CreateBook.dto';
import { UpdateBookDto } from './dto/UpdateBookDto';
import { GetAllBooksQuery } from './queries/GetAllBooks.query';
import { User } from 'src/auth/schemas/User.schema';

const RESULT_PER_PAGE = 2;

@Injectable()
export class BookService {
  constructor(
    @InjectModel(Book.name) private readonly bookModel: Model<Book>,
  ) {}

  async findAll(query: GetAllBooksQuery): Promise<Book[]> {
    const resultPerPage = RESULT_PER_PAGE;
    const currentPage = Number(query.page) || 1;
    const skip = resultPerPage * (currentPage - 1);

    const keyword = query.keyword
      ? {
          title: {
            $regex: query.keyword,
            $options: 'i',
          },
        }
      : {};

    return await this.bookModel
      .find({ ...keyword })
      .limit(resultPerPage)
      .skip(skip);
  }

  async findById(id: string): Promise<Book> {
    const isValidId = mongoose.isValidObjectId(id);
    if (!isValidId) {
      throw new BadRequestException('Invalid Id');
    }

    const book = await this.bookModel.findById(id);
    if (!book) {
      throw new NotFoundException('Book not found');
    }

    return book;
  }

  async createBook(createBookDto: CreateBookDto, user: User): Promise<Book> {
    const data = Object.assign(createBookDto, { user: user._id });

    return this.bookModel.create(data);
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
