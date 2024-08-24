import { GameService } from './game.service';
import { UsersService } from './../users/users.service';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import {
  BadRequestException,
  ConflictException,
  UseGuards,
} from '@nestjs/common';
import { GAME } from 'src/shared/constants/response-messages';
import { GAME_EVENT } from 'src/shared/constants/game-events';
import { GAME_STATUS } from 'src/shared/constants/game-status';
import { MakeMoveDto } from './dto/game.dto';
import { Chess } from 'chess.js';
import { WSGuard } from 'src/guards/socket.guard';
import { SocketWithUser } from './game.interface';

@WebSocketGateway()
@UseGuards(WSGuard)
export class GameGateway {
  constructor(
    private readonly usersService: UsersService,
    private readonly gameService: GameService,
  ) {}
  @WebSocketServer()
  server: Server;

  private generateGameId(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  private swipeTurn(
    currentTurn: number,
    player1: number,
    player2: number,
  ): number {
    const playerIdForNextTurn = currentTurn === player1 ? player2 : player1;
    return playerIdForNextTurn;
  }

  @SubscribeMessage(GAME_EVENT.CREATE.CREATING)
  async handleCreateGame(@ConnectedSocket() client: SocketWithUser) {
    try {
      const playerId = client?.user?.id;

      const player = await this.usersService.findUserByID(playerId);

      if (!player) {
        throw new BadRequestException(GAME.ErrorMessages.PLAYER_NOT_FOUND);
      }

      const gameId = this.generateGameId();
      const chess = new Chess();
      const boardState = chess.fen();
      const gamePayload = {
        player1: playerId,
        gameId,
        boardState,
      };

      await this.gameService.createGame(gamePayload);

      client.join(gameId);
      client.emit(GAME_EVENT.CREATE.CREATED, { gameId });
    } catch (error) {
      console.log('🚀 ~ GameGateway ~ handleCreateGame ~ error:', error);
      client.emit(GAME_EVENT.ERROR.ERROR_OCCURED, {
        message: error?.message,
      });
    }
  }

  @SubscribeMessage(GAME_EVENT.JOIN.JOINING)
  async handleJoinGame(
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody() payload: any,
  ) {
    try {
      const parsedPayload: { gameId: string } = JSON.parse(payload);
      const playerId = client?.user?.id;

      const player = await this.usersService.findUserByID(playerId);

      if (!player) {
        throw new BadRequestException(GAME.ErrorMessages.PLAYER_NOT_FOUND);
      }

      const gameFound = await this.gameService.findGame(parsedPayload.gameId);

      if (gameFound?.player1 === playerId) {
        throw new BadRequestException(GAME.ErrorMessages.YOU_ARE_HOST);
      } else if (gameFound && gameFound.gameStatus === GAME_STATUS.STARTED) {
        throw new ConflictException(GAME.ErrorMessages.GAME_ALREADY_STARTED);
      } else if (gameFound && gameFound.gameStatus === GAME_STATUS.FINISHED) {
        throw new ConflictException(GAME.ErrorMessages.GAME_ALREADY_FINISHED);
      }

      const updatePayload = {
        player2: playerId,
        gameStatus: GAME_STATUS.STARTED,
        whitePlayer: gameFound?.player1,
        blackPlayer: playerId,
        currentTurn: gameFound?.player1,
      };

      await this.gameService.updateGame(gameFound?.gameId, updatePayload);

      client.join(gameFound.gameId);
      this.server.to(gameFound?.gameId).emit(GAME_EVENT.JOIN.JOINED, {
        message: GAME_STATUS.STARTED,
        boardState: gameFound?.boardState,
        whitePlayer: gameFound?.player1,
        blackPlayer: playerId,
        currentTurn: gameFound?.player1,
      });
    } catch (error) {
      client.emit(GAME_EVENT.ERROR.ERROR_OCCURED, {
        message: error?.message,
      });
    }
  }

  @SubscribeMessage(GAME_EVENT.MOVE.MOVING)
  async handlePlayerMove(
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody() payload: string,
  ) {
    try {
      const parsedPayload: MakeMoveDto = JSON.parse(payload);
      const gameId = parsedPayload.gameId;
      const { from, to } = parsedPayload;
      const playerId = client?.user?.id;

      const gameFound = await this.gameService.findGame(gameId);

      if (playerId !== gameFound?.player1 && playerId !== gameFound?.player2) {
        throw new BadRequestException(GAME.ErrorMessages.PLAYER_NOT_FOUND);
      } else if (gameFound?.currentTurn !== playerId) {
        throw new BadRequestException(GAME.ErrorMessages.NOT_YOUR_TURN);
      }

      const chess = new Chess(gameFound.boardState);
      const move = chess.move({ from, to });

      if (!move) {
        throw new BadRequestException(GAME.ErrorMessages.NOT_VALID_MOVE);
      }

      const boardState = chess.fen();
      const nextTurn = this.swipeTurn(
        gameFound.currentTurn,
        gameFound.player1,
        gameFound.player2,
      );

      let response: any = {
        boardState,
        currentTurn: nextTurn,
      };
      if (chess.isCheckmate()) {
        response = {
          ...response,
          gameStatus: GAME_STATUS.FINISHED,
          winner: parsedPayload.playerId,
          result: 'checkmate',
        };
      } else if (chess.isDraw()) {
        response = {
          ...response,
          gameStatus: GAME_STATUS.FINISHED,
          result: 'draw',
        };
      } else if (chess.isStalemate()) {
        response = {
          ...response,
          gameStatus: GAME_STATUS.FINISHED,
          result: 'stalemate',
        };
      }

      const updatePayload = {
        ...response,
      };
      await this.gameService.updateGame(gameFound.gameId, updatePayload);
      this.server.to(gameFound.gameId).emit(GAME_EVENT.MOVE.MOVED, response);
    } catch (error) {
      client.emit(GAME_EVENT.ERROR.ERROR_OCCURED, {
        message: error?.message,
      });
    }
  }
}
