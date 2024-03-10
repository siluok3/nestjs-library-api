import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { AuthService } from './auth.service';
import { User } from './schemas/User.schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from './dto/SignUp.dto';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/Login.dto';

describe('Auth Service', () => {
  let authService: AuthService;
  let model: Model<User>;
  let jwtService: JwtService;

  const mockedUser = {
    _id: '65ecae36361b7a280ab61d03',
    name: 'siluok3',
    email: 'ksks@gmail.com',
  };

  const access_token = 'jwtToken';

  const mockAuthService = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        {
          provide: getModelToken(User.name),
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    model = module.get<Model<User>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('Signup', () => {
    const signupDto: SignUpDto = {
      name: 'Kiriakos',
      email: 'email@gmail.com',
      password: 'password',
    };

    it('should register new user', async () => {
      jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValue('hashedPassword' as unknown as never);
      jest
        .spyOn(model, 'create')
        .mockImplementationOnce(() => Promise.resolve(mockedUser) as any);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('jwtToken');

      const result = await authService.signUp(signupDto);

      expect(bcrypt.hash).toHaveBeenCalled();
      expect(result).toEqual({ access_token });
    });

    it('should throw error during sign up for duplicate email', async () => {
      jest
        .spyOn(model, 'create')
        .mockImplementationOnce(() => Promise.reject({ code: 11000 }));

      await expect(authService.signUp(signupDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('Login', () => {
    const loginDto: LoginDto = {
      email: 'email@gmail.com',
      password: 'password',
    };

    it('should login successfully', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValueOnce(mockedUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true as never);
      jest.spyOn(jwtService, 'sign').mockReturnValue(access_token);

      const result = await authService.login(loginDto);

      expect(result).toEqual({ access_token });
    });

    it('should throw Invalid email or password', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValueOnce(null);

      expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw Incorrect password', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValueOnce(mockedUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false as never);

      expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
