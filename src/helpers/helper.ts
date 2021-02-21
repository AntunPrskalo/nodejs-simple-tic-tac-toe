import { GameChar } from '../model/game.model';

export function getRandomChar(): GameChar {
    return  [GameChar.X, GameChar.O][Math.floor(Math.random())];
}

export function getOtherChar(char: GameChar): GameChar {
    return (char === GameChar.O) ? GameChar.X : GameChar.O;
}