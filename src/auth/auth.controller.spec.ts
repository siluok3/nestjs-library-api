import { Test, TestingModule } from '@nestjs/testing';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LoginDto } from './dto/Login.dto';
import { SignUpDto } from './dto/SignUp.dto';

describe('Auth Controller', () => {
  let authService: AuthService;
  let authController: AuthController;

  const mockedUser = {
    _id: '65ecae36361b7a280ab61d03',
    name: 'siluok3',
    email: 'ksks@gmail.com',
  };

  let jwtToken = 'jwtToken';

  const mockAuthService = {
    signUp: jest.fn().mockImplementationOnce(() => jwtToken),
    login: jest.fn().mockImplementationOnce(() => jwtToken),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    authController = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('Signup', () => {
    const signupDto: SignUpDto = {
      name: 'Kiriakos',
      email: 'email@gmail.com',
      password: 'password',
    };

    it('should register user', async () => {
      const result = await authController.signUp(signupDto);

      expect(authService.signUp).toHaveBeenCalled();
      expect(result).toEqual(jwtToken);
    });
  });

  describe('Login', () => {
    const loginDto: LoginDto = {
      email: 'email@gmail.com',
      password: 'password',
    };

    it('should login user', async () => {
      const result = await authController.login(loginDto);

      expect(authService.login).toHaveBeenCalled();
      expect(result).toEqual(jwtToken);
    });
  });
});
