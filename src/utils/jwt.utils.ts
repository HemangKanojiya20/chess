import { UnauthorizedException } from '@nestjs/common';
import { JwtPayload, sign, verify } from 'jsonwebtoken';
import { appConfig } from 'src/config/app.config';

interface TokenPayload extends JwtPayload {
  id?: number;
  email?: string;
  username?: string;
}

export const jwtSign = (payload: TokenPayload) =>
  sign(payload, appConfig.jwtSecretKey, {
    expiresIn: '60m',
  });

export const verifyToken = (token: string): JwtPayload => {
  try {
    return verify(token, appConfig.jwtSecretKey) as JwtPayload;
  } catch {
    throw new UnauthorizedException();
  }
};

export const decodeToken = (authorization: string) => {
  let authToken = authorization;

  if (authorization.includes('Bearer')) {
    [, authToken] = authorization.split(' ');
  }

  const { id } = verifyToken(authToken);

  return { id };
};
