import { IGame, IMove } from '../model/game.model';

export class RandomAI {

    public pickNextMove(game: IGame): number[] {

        const availableFields = [];

        for (let i = 0; i <= 2; i++) {
            for (let j = 0; j <= 2; j++) {
                if (!game.moves.find(move => move.field[0] === i && move.field[1] === j)) {
                    availableFields.push([i, j]);
                }
            }
        }

        return availableFields[Math.floor(Math.random() * availableFields.length)];
    }
}

