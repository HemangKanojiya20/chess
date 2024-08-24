import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';

import { CreateUserDto, LoginUserDto } from './dto/users.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() userData: CreateUserDto, @Res() res: Response) {
    try {
      const newUser = await this.usersService.createNewUser(userData);
      return res.status(201).send({ data: newUser });
    } catch (error) {
      throw error;
    }
  }

  @Post('login')
  async login(@Body() userData: LoginUserDto, @Res() res: Response) {
    console.log('🚀 ~ UsersController ~ login ~ userData:', userData);
    try {
      const user = await this.usersService.login(userData);
      return res.status(200).send({ data: user });
    } catch (error) {
      console.log('🚀 ~ UsersController ~ login ~ error:', error);
      throw error;
    }
  }
}
