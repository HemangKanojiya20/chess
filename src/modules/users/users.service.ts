import { JwtService } from '@nestjs/jwt';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { CreateUserDto, LoginUserDto } from './dto/users.dto';
import { USER } from 'src/shared/constants/response-messages';
import { User } from './entities/users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async findUser(identifier: string) {
    const user = await this.userRepository.findOne({
      where: [{ username: identifier }, { email: identifier }],
    });

    return user;
  }

  async findUserByID(identifier: number) {
    if (!identifier) {
      throw new Error('PLEASE PROVIDE PLAYER ID');
    }
    console.log('🚀 ~ UsersService ~ findUserByID ~ identifier:', identifier);
    const user = await this.userRepository.findOne({
      where: [{ id: identifier }],
    });

    return user;
  }
  async createNewUser(user: CreateUserDto) {
    const { password, email, username } = user;

    const existingEmail = await this.userRepository.findOne({
      where: { email: email },
    });

    // check if email already exists
    if (existingEmail) {
      throw new HttpException(
        USER.ErrorMessages.USER_EMAIL_ALREADY_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if the username already exists
    const existingUsername = await this.userRepository.findOne({
      where: { username: username },
    });

    if (existingUsername) {
      throw new HttpException(
        USER.ErrorMessages.USERNAME_ALREADY_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const newUser = this.userRepository.create({
      ...user,
      password: hashedPassword,
    });

    await this.userRepository.save(newUser);

    return {
      status: HttpStatus.CREATED,
      message: 'User registered',
    };
  }

  async login(credentials: LoginUserDto) {
    const { username, password } = credentials;

    // if email or password are not provided
    if (!username || !password) {
      throw new HttpException(
        USER.ErrorMessages.EMAIL_OR_PASSWORD_REQUIRED,
        HttpStatus.BAD_REQUEST,
      );
    }

    // find user
    const user = await this.userRepository.findOne({
      where: [{ username }],
    });

    // if user does not exist
    if (!user) {
      throw new BadRequestException(USER.ErrorMessages.USER_INVALID_CREDS);
    }

    // check password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      throw new BadRequestException(USER.ErrorMessages.USER_INVALID_CREDS);
    }

    // Generate JWT token
    const tokenPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
    };
    const token = this.jwtService.sign(tokenPayload);

    return {
      message: 'Login successful',
      access_token: token,
    };
  }
}
