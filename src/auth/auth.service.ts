import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { InjectModel } from 'nestjs-typegoose';
import { UserModel } from 'src/user/user.model';
import { AuthDto, LoginDto } from './dto/auth.dto';
import { hash, genSalt, compare } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import mongoose from 'mongoose';
import { TokenModel } from './token.model';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserModel) private readonly UserModel: ModelType<UserModel>,
    @InjectModel(TokenModel) private readonly TokenModel: ModelType<TokenModel>,
    private readonly jwtService: JwtService,
  ) {}

  async login({ email, password }: LoginDto) {
    const user = await this.validateUser(email, password);

    const tokens = await this.issueTokenPair(String(user._id));

    return {
      user: this.returnUserFields(user),
      ...tokens,
    };
  }

  async register(dto: AuthDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const oldUser = await this.findByEmail(dto.email);
    if (oldUser) {
      throw new BadRequestException(
        'User with this email is already in the system',
      );
    }

    const salt = await genSalt(10);
    const newUser = new this.UserModel({
      _id: new mongoose.Types.ObjectId(),
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      password: await hash(dto.password, salt),
    });

    const user = await newUser.save();
    const tokens = await this.issueTokenPair(String(user._id));
    await this.saveAccessToken(String(user._id), tokens.accessToken);

    return {
      user: this.returnUserFields(user),
      ...tokens,
    };
  }

  async saveAccessToken(userId: string, accessToken: string) {
    const tokenDocument = new this.TokenModel({
      userId,
      accessToken,
    });

    await tokenDocument.save();
  }

  async getNewTokens({ refreshToken }: RefreshTokenDto) {
    if (!refreshToken) throw new UnauthorizedException('Please sign in!');

    const result = await this.jwtService.verifyAsync(refreshToken);

    if (!result) throw new UnauthorizedException('Invalid token or expired!');

    const user = await this.UserModel.findById(result._id);

    const tokens = await this.issueTokenPair(String(user._id));

    return {
      user: this.returnUserFields(user),
      ...tokens,
    };
  }

  async findByEmail(email: string) {
    return this.UserModel.findOne({ email }).exec();
  }

  async validateUser(email: string, password: string): Promise<UserModel> {
    const user = await this.findByEmail(email);
    if (!user) throw new UnauthorizedException('User not found');

    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) throw new UnauthorizedException('Invalid password');

    return user;
  }

  async issueTokenPair(userId: string) {
    const data = { _id: userId };

    const refreshToken = await this.jwtService.signAsync(data, {
      expiresIn: '30d',
    });

    const accessToken = await this.jwtService.signAsync(data, {
      expiresIn: '1h',
    });

    return { refreshToken, accessToken };
  }

  returnUserFields(user: UserModel) {
    return {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }
}
