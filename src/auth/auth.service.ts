import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/User.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/SignUp.dto';
import { LoginDto } from './dto/Login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<{ access_token: string }> {
    const { email, name, password } = signUpDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await this.userModel.create({
        name,
        email,
        password: hashedPassword,
      });

      return {
        access_token: await this.jwtService.signAsync({ id: user._id }),
      };
    } catch (error) {
      if (error?.code === 11000) {
        throw new ConflictException('Duplicate email');
      }
    }
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPassMatched = await bcrypt.compare(password, user.password);
    if (!isPassMatched) {
      throw new UnauthorizedException('Incorrect password');
    }

    return {
      access_token: this.jwtService.sign({ id: user._id }),
    };
  }
}
