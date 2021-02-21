import * as uuid from 'uuid';

export interface IGame {
    id: string;
    status: Status;
    isMultiplayer: boolean;
    players: IPlayer[];
    moves: IMove[];
    result?: IResult;
}

export interface IPlayer {
    id: string;
    char: GameChar;
}

export interface IMove {
    char: GameChar;
    field: number[];
}

export interface IResult {
    result: GameResult;
    winningChar?: GameChar;
}

export enum Status {
    initial = 'initial',
    inProgress = 'inProgress',
    finished = 'finished',
}

export enum GameChar {
    X = 'X',
    O = 'O',
}

export enum GameResult {
    win = 'win',
    draw = 'draw',
}

export class GameModel {

    private storage: any;

    public constructor(storage) {
        this.storage = storage;
    }

    public async getGameById(gameId: string): Promise<IGame> {
        try {
            return this.storage.get(gameId) as IGame;
        }
        catch (error) {
            return Promise.reject(error);
        }
    }

    public async createGame(player: IPlayer, isMultiplayer: boolean): Promise<IGame> {
        const newGame: IGame = {
            id: uuid.v4(),
            status: Status.initial,
            players: [player],
            moves: [],
            isMultiplayer,
        };

        try {
            return this.storage.upsert(newGame);
        }
        catch (error) {
            return Promise.reject(error);
        }
    }

    public isPlayersTurn(player: IPlayer, game: IGame): boolean {
        if (!game.moves.length) {
            return true;
        }

        const lastPlayedMove = game.moves[game.moves.length - 1];

        return lastPlayedMove.char !== player.char;
    }

    public isFieldAvailable(field: number[], game: IGame): boolean {
        if (game.moves.find(move => move.field[0] === field[0] && move.field[1] === field[1])) {
            return true;
        }

        return false;
    }

    public async addPlayer(gameId: string, player: IPlayer): Promise<IGame> {
        try {
            const game = await this.storage.get(gameId) as IGame;

            game.players.push(player);

            return this.storage.upsert(game);
        }
        catch (error) {
            return Promise.reject(error);
        }
    }

    public async addMove(gameId: string, player: IPlayer, move: IMove): Promise<IGame> {
        try {
            const game = await this.storage.get(gameId) as IGame;

            game.moves.push(move);

            if (game.status === Status.initial) {
                game.status = Status.inProgress;
            }

            return this.storage.upsert(game);
        }
        catch (error) {
            return Promise.reject(error);
        }
    }

    public async updateResult(gameId: string): Promise<IGame> {
        try {
            const game = await this.storage.get(gameId) as IGame;

            const xwinning = this.checkIfWinning(GameChar.X, game.moves);
            const owinning = this.checkIfWinning(GameChar.O, game.moves);

            if (xwinning) {
                game.status = Status.finished;
                game.result = {
                    result: GameResult.win,
                    winningChar: GameChar.X,
                };
            }
            else if (owinning) {
                game.status = Status.finished;
                game.result = {
                    result: GameResult.win,
                    winningChar: GameChar.O,
                };
            }
            else if (!xwinning && !owinning && game.moves.length === 9) {
                game.status = Status.finished;
                game.result = {
                    result: GameResult.draw
                };
            }

            return this.storage.upsert(game);
        }
        catch (error) {
            return Promise.reject(error);
        }
    }

    public async findFinishedGamesByPlayer(playerId: string): Promise<IGame[]> {
        try {
            const finishedGames: IGame[] = await this.storage.find({
                status: Status.finished,
            });

            return finishedGames.filter(game => !!game.players.find(player => player.id === playerId));
        }
        catch (error) {
            return Promise.reject(error);
        }
    }

    private checkIfWinning(char: GameChar, moves: IMove[]) {
        for (let i = 0; i <= 2; i++) {
            const inRow = moves.filter(move => move.char === char && move.field[0] === i);
            const inColumn = moves.filter(move => move.char === char && move.field[1] === i);

            if (inRow.length === 3 || inColumn.length === 3) {
                return true;
            }
        }

        const diag1 = moves.filter(move => move.char === char && move.field[0] === move.field[1]);

        if (diag1.length === 3) {
            return true;
        }

        const diag2 = moves.filter(move => move.char === char && (move.field[0] + move.field[1] === 2));

        if (diag2.length === 3) {
            return true;
        }

        return false;
    }
}
