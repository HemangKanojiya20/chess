import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Game } from './entities/game.entity';
import { Repository } from 'typeorm';
import { GameDto, UpdateGameDto } from './dto/game.dto';
import { GAME } from 'src/shared/constants/response-messages';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game) private readonly gameRepository: Repository<Game>,
  ) {}

  async createGame(gameDto: GameDto) {
    const newGame = this.gameRepository.create(gameDto);
    await this.gameRepository.save(newGame);
  }

  async findGame(gameId: string) {
    if (!gameId) {
      throw new Error('PLEASE PROVIDE GAME ID');
    }
    const gameFound = await this.gameRepository.findOne({
      where: [{ gameId }],
    });

    if (!gameFound) {
      throw new NotFoundException(GAME.ErrorMessages.GAME_NOT_FOUND);
    }

    return gameFound;
  }

  async updateGame(gameId: string, payload: UpdateGameDto) {
    await this.gameRepository.update({ gameId }, payload);
  }
}
