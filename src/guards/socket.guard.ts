import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Socket } from 'socket.io';
import { GAME_EVENT } from 'src/shared/constants/game-events';
import { decodeToken } from 'src/utils/jwt.utils';

export class WSGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext) {
    const client: Socket = context.switchToWs().getClient<Socket>();
    try {
      const token = client.handshake.headers.authorization;

      if (!token) {
        throw new UnauthorizedException();
      }

      const payload = decodeToken(token);
      context.switchToHttp().getRequest().user = payload;
      return true;
    } catch (error) {
      client.emit(GAME_EVENT.ERROR.ERROR_OCCURED, {
        message: error?.message,
      });
    }
  }
}
