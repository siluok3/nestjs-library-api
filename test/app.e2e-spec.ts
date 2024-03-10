import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Category } from './../src/book/schemas/book.schema';

describe('Books & Auth Controllers (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri);

    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected for testing');
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await mongoose.connection.dropDatabase();
  });

  const user = {
    name: 'siluok25',
    email: 'koulis25@gmail.com',
    password: '12345678',
  };

  let jwtToken = '';
  let bookCreated;

  describe('Auth', () => {
    it('(POST) - Register new user', async () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send(user)
        .expect(201)
        .then((res) => {
          expect(res.body.access_token).toBeDefined();
        });
    });

    it('(GET) - Login user', async () => {
      return request(app.getHttpServer())
        .get('/auth/login')
        .send({ email: user.email, password: user.password })
        .expect(200)
        .then((res) => {
          expect(res.body.access_token).toBeDefined();
          jwtToken = res.body.access_token;
        });
    });
  });

  describe('Book', () => {
    const newBook = {
      title: 'title',
      description: 'desc',
      author: 'author',
      price: 10,
      category: Category.CLASSICS,
    };

    it('(POST) - Create New Book', async () => {
      return request(app.getHttpServer())
        .post('/books')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(newBook)
        .expect(201)
        .then((res) => {
          expect(res.body._id).toBeDefined();
          expect(res.body.title).toEqual(newBook.title);
          bookCreated = res.body;
        });
    });

    it('(GET) - Get All Books', async () => {
      return request(app.getHttpServer())
        .get('/books')
        .expect(200)
        .then((res) => {
          expect(res.body.length).toEqual(1);
        });
    });

    it('(GET) - Get Book by Id', async () => {
      return request(app.getHttpServer())
        .get(`/books/${bookCreated?._id}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeDefined();
          expect(res.body._id).toEqual(bookCreated._id);
        });
    });

    it('(PATCH) - Update book', async () => {
      const updatedBook = { description: 'updated name' };
      return request(app.getHttpServer())
        .patch(`/books/${bookCreated?._id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(updatedBook)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeDefined();
          expect(res.body.description).toEqual(updatedBook.description);
        });
    });

    it('(DELETE) - Delete book', async () => {
      return request(app.getHttpServer())
        .delete(`/books/${bookCreated?._id}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeDefined();
          expect(res.body.deleted).toEqual(true);
        });
    });
  });
});
