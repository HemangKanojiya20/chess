import { InjectRepository } from '@nestjs/typeorm';
import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { decodeToken } from 'src/utils/jwt.utils';
import { User } from 'src/modules/users/entities/users.entity';
import { Repository } from 'typeorm';
import { USER } from 'src/shared/constants/response-messages';

export class Authguard implements CanActivate {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const token = request.headers.authorization;

    if (!token) {
      throw new UnauthorizedException();
    }

    const { id } = decodeToken(token);
    const user = await this.userRepository.findOne({ where: [{ id: id }] });

    if (!user) {
      throw new UnauthorizedException(USER.ErrorMessages.USER_NOT_FOUND);
    }

    const { password, ...userData } = user;

    request.user = userData;

    return true;
  }
}
