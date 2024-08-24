import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { Game } from './entities/game.entity';
import { UsersModule } from '../users/users.module';
import { GameService } from './game.service';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([Game])],
  providers: [GameGateway, GameService],
})
export class GameModule {}
