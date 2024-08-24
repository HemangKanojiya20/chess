import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class GameDto {
  @IsNumber()
  @IsNotEmpty()
  player1: number;

  @IsString()
  @IsNotEmpty()
  gameId: string;

  @IsNotEmpty()
  boardState: string;
}

export class JoinGameDto {
  @IsString()
  @IsNotEmpty()
  gameId: string;

  @IsNotEmpty()
  @IsNumber()
  playerId: number;
}

export class UpdateGameDto {
  @IsNumber()
  @IsNotEmpty()
  player2?: number;

  @IsString()
  @IsNotEmpty()
  gameStatus?: string;

  @IsNumber()
  @IsNotEmpty()
  whitePlayer?: number;

  @IsNumber()
  @IsNotEmpty()
  blackPlayer?: number;

  @IsNumber()
  @IsNotEmpty()
  currentTurn: number;
}

export class MakeMoveDto {
  @IsNumber()
  @IsNotEmpty()
  playerId: number;

  @IsString()
  @IsNotEmpty()
  gameId: string;

  @IsString()
  @IsNotEmpty()
  from: string;

  @IsString()
  @IsNotEmpty()
  to: string;
}
