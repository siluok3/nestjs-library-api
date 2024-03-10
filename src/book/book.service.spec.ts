import { Test, TestingModule } from '@nestjs/testing';
import { BookService } from './book.service';
import { Book, Category } from './schemas/book.schema';
import { getModelToken } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from './dto/CreateBook.dto';
import { User } from '../auth/schemas/User.schema';
import { title } from 'process';
import { UpdateBookDto } from './dto/UpdateBookDto';

describe('Book Service', () => {
  let bookService: BookService;
  let model: Model<Book>;

  const mockedBook = {
    _id: '65ec6bc3151995e263848335',
    user: '65ec6bc3151995e263848335',
    title: 'title',
    description: 'desc',
    author: 'author',
    price: 10,
    category: Category.CLASSICS,
  };

  const mockedUser = {
    _id: '65ecae36361b7a280ab61d03',
    name: 'siluok3',
    email: 'ksks@gmail.com',
  };

  const mockBookService = {
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookService,
        {
          provide: getModelToken(Book.name),
          useValue: mockBookService,
        },
      ],
    }).compile();

    bookService = module.get<BookService>(BookService);
    model = module.get<Model<Book>>(getModelToken(Book.name));
  });

  describe('findAll', () => {
    it('should return an array of books', async () => {
      const query = {
        page: 1,
        keyword: 'test',
      };

      jest.spyOn(model, 'find').mockImplementation(
        () =>
          ({
            limit: () => ({
              skip: jest.fn().mockResolvedValue([mockedBook]),
            }),
          }) as any,
      );

      const books = await bookService.findAll(query);

      expect(books).toEqual([mockedBook]);
      expect(model.find).toHaveBeenCalledWith({
        title: { $regex: 'test', $options: 'i' },
      });
    });
  });

  describe('findById', () => {
    it('should find and return a book by Id', async () => {
      jest.spyOn(model, 'findById').mockResolvedValue(mockedBook);

      const book = await bookService.findById(mockedBook._id);

      expect(model.findById).toHaveBeenCalledWith(mockedBook._id);
      expect(book).toEqual(mockedBook);
    });

    it('should throw bad request exception for invalid id', async () => {
      const invalidId = 'invalid-id';

      const isValidObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(bookService.findById(invalidId)).rejects.toThrow(
        BadRequestException,
      );
      expect(isValidObjectIdMock).toHaveBeenCalledWith(invalidId);
      isValidObjectIdMock.mockRestore();
    });

    it('should throw not found exception for not found book', async () => {
      jest.spyOn(model, 'findById').mockResolvedValue(null);

      await expect(bookService.findById(mockedBook._id)).rejects.toThrow(
        NotFoundException,
      );
      expect(model.findById).toHaveBeenCalledWith(mockedBook._id);
    });
  });

  // describe('createBooks', () => {
  //   it('should create and return a book', async () => {
  //     const newBook = {
  //       title: 'title',
  //       description: 'desc',
  //       author: 'author',
  //       price: 10,
  //       category: Category.CLASSICS,
  //     };

  //     jest
  //       .spyOn(model, 'create')
  //       .mockImplementationOnce(() => Promise.resolve(mockedBook));

  //     const result = await bookService.createBook(
  //       newBook as CreateBookDto,
  //       mockedUser as User,
  //     );

  //     expect(result).toEqual(mockedBook);
  //   });
  // });

  describe('updateBook', () => {
    it('should update and return a book', async () => {
      const updatedBook = {
        ...mockedBook,
        description: 'Updated description',
      };
      const book = { description: 'Updated description' };

      jest.spyOn(model, 'findByIdAndUpdate').mockResolvedValue(updatedBook);

      const result = await bookService.updateBook(
        mockedBook._id,
        book as UpdateBookDto,
      );

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        mockedBook._id,
        book,
        { new: true, runValidators: true },
      );
      expect(result.description).toEqual(book.description);
    });
  });

  describe('deleteBook', () => {
    it('should delete and return a book', async () => {
      jest.spyOn(model, 'findByIdAndDelete').mockResolvedValue(mockedBook);

      const result = await bookService.deleteBook(mockedBook._id);

      expect(model.findByIdAndDelete).toHaveBeenCalledWith(mockedBook._id,);
      expect(result).toEqual(mockedBook);
    });
  });
});
