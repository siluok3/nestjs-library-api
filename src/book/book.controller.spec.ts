import { Test, TestingModule } from '@nestjs/testing';
import { BookService } from './book.service';
import { Category } from './schemas/book.schema';
import { BookController } from './book.controller';
import { PassportModule } from '@nestjs/passport';
import { GetAllBooksQuery } from './queries/GetAllBooks.query';
import { CreateBookDto } from './dto/CreateBook.dto';
import { UpdateBookDto } from './dto/UpdateBookDto';

describe('Book Controller', () => {
  let bookService: BookService;
  let bookController: BookController;

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
    findAll: jest.fn().mockImplementationOnce(() => [mockedBook]),
    findById: jest.fn().mockResolvedValue(mockedBook),
    createBook: jest.fn(),
    updateBook: jest.fn(),
    deleteBook: jest.fn().mockResolvedValueOnce({ deleted: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [BookController],
      providers: [
        {
          provide: BookService,
          useValue: mockBookService,
        },
      ],
    }).compile();

    bookService = module.get<BookService>(BookService);
    bookController = module.get<BookController>(BookController);
  });

  it('should be defined', () => {
    expect(bookController).toBeDefined();
  });

  describe('Book Controller', () => {
    it('should get all books', async () => {
      const query: GetAllBooksQuery = {
        keyword: 'test',
        page: 1,
      };

      const result = await bookController.getAllBooks(query);

      expect(bookService.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockedBook]);
    });

    it('should get book by id', async () => {
      const result = await bookController.getBookById(mockedBook._id);

      expect(bookService.findById).toHaveBeenCalled();
      expect(result).toEqual(mockedBook);
    });

    it('should create a book', async () => {
      const createBookDto: CreateBookDto = {
        title: 'title',
        description: 'desc',
        author: 'author',
        price: 10,
        category: Category.CLASSICS,
      };

      mockBookService.createBook = jest.fn().mockResolvedValueOnce(mockedBook);

      const result = await bookController.createBook(createBookDto, mockedUser);

      expect(bookService.createBook).toHaveBeenCalled();
      expect(result).toEqual(mockedBook);
    });

    it('should update a book', async () => {
      const updatedBook = {
        ...mockedBook,
        description: 'Updated description',
      };
      const book = { description: 'Updated description' };

      mockBookService.updateBook = jest.fn().mockResolvedValueOnce(updatedBook);

      const result = await bookController.updateBook(
        mockedBook._id,
        book as UpdateBookDto,
      );

      expect(bookService.updateBook).toHaveBeenCalled();
      expect(result).toEqual(updatedBook);
    });

    it('should delete a book', async () => {
      const result = await bookController.deleteBook(mockedBook._id);

      expect(bookService.deleteBook).toHaveBeenCalled();
      expect(result).toEqual({ deleted: true });
    });
  });
});
