import { GAME_STATUS } from 'src/shared/constants/game-status';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  gameId: string;

  @Column()
  player1: number;

  @Column({ nullable: true })
  player2?: number;

  @Column({ default: GAME_STATUS.WAITING })
  gameStatus: string;

  @Column('json')
  boardState: string;

  @Column({ nullable: true })
  whitePlayer: number;

  @Column({ nullable: true })
  blackPlayer: number;

  @Column({ nullable: true })
  currentTurn: number;

  @Column({ nullable: true })
  winner: number;

  @Column({ nullable: true })
  result: string;
}
