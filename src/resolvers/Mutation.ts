import { getOtherChar, getRandomChar } from '../helpers/helper';
import { GameChar, IGame, IMove, IPlayer, GameResult, Status } from '../model/game.model';
import * as uuid from 'uuid';

const Mutation = {

    async createGame(parent, args, { request, gameModel, pubsub, logger }, info) {
        let isMultiplayer: boolean = args.data.isMultiplayer;
        let playerId: string = args.data.playerId;
        let playerChar: GameChar = args.data.playerChar;

        if (!isMultiplayer) {
            isMultiplayer = false;
        }

        if (!playerId) {
            playerId = uuid.v4();
        }

        if (!playerChar) {
            playerChar = getRandomChar();
        }

        const player: IPlayer = {
            id: playerId,
            char: playerChar
        };

        const game = await gameModel.createGame(player, isMultiplayer);
        logger.info(`Game created. Game ID: ${game.id}, Player ID: ${player.id}`);

        pubsub.publish(`game-${game.id}`, {
            game: {
                data: {
                    gameId: game.id,
                    status: game.status,
                    moves: game.moves,
                    result: game.result,
                    isMultiplayer: game.isMultiplayer,
                }
            }
        });

        return {
            playerId,
            gameId: game.id,
        };
    },

    async joinGame(parent, args, { pubsub, gameModel, logger }, info) {
        const gameId: string = args.data.gameId;
        let playerId: string = args.playerId;

        const game: IGame = await gameModel.getGameById(gameId);

        if (!game) {
            throw new Error(`Game not found.`);
        }

        if (!game.isMultiplayer) {
            throw new Error(`Cannot join a single player game.`);
        }

        if (game.isMultiplayer && game.players.length > 1) {
            throw new Error(`Cannot join a multiplayer game with two player already`);
        }

        if (game.status === Status.finished) {
            throw new Error(`This game is finished.`);
        }

        if (game.status === Status.inProgress && game.moves.length > 1) {
            throw new Error(`Cannot join an in-progress game with more than one move played.`);
        }

        const otherPlayer = game.players[0];

        if (playerId && playerId === otherPlayer.id) {
            throw new Error(`Playing with yourself is not allowed. Game ID: ${gameId}`);
        }

        if (!playerId) {
            playerId = uuid.v4();
        }

        const player: IPlayer = {
            id: playerId,
            char: getOtherChar(otherPlayer.char),
        };

        await gameModel.addPlayer(gameId, player);
        logger.info(`Player joined an existing game. Game ID: ${game.id}, Player ID: ${player.id}`);

        pubsub.publish(`game-${gameId}`, {
            game: {
                data: {
                    gameId: game.id,
                    status: game.status,
                    moves: game.moves,
                    result: game.result,
                    isMultiplayer: game.isMultiplayer,
                }
            }
        });

        return {
            playerId,
            gameId
        };
    },

    async move(parent, args, { pubsub, gameModel, ai, logger }, info) {
        const gameId: string = args.data.gameId;
        const playerId: string = args.data.playerId;
        const field: number[] = args.data.field;

        if (field.length !== 2 || field.find(item => [0, 1, 2].indexOf(item) === -1)) {
            throw new Error(`Invalid field value. Field array must be in form of [rowNum, colNum].`);
        }

        let game: IGame = await gameModel.getGameById(gameId);

        if (!game) {
            throw new Error(`Game ${gameId} not found`);
        }

        if (game.status === Status.finished) {
            throw new Error(`Game ${gameId} is not in progrees.`);
        }

        const currentPlayer: IPlayer = game.players.find(player => player.id === playerId);

        if (!currentPlayer) {
            throw new Error(`Player ${playerId} not found on game ${gameId}.`);
        }

        if (game.status === Status.inProgress && !gameModel.isPlayersTurn(currentPlayer, game)) {
            throw new Error(`Player ${playerId} cannot make a move in game ${gameId}`);
        }

        if (gameModel.isFieldAvailable(field, game)) {
            throw new Error(`Field position (${field[0]}, ${field[1]}) is not available in game ${gameId}`);
        }

        const move: IMove = {
            char: currentPlayer.char,
            field,
        };

        await gameModel.addMove(gameId, currentPlayer, move);
        logger.info(`Player made a move. Game ID: ${game.id}, Player ID: ${currentPlayer.id}, Player CHAR: ${currentPlayer.char}, Move: (${move.field[0]}, ${move.field[1]})`);

        game = await gameModel.updateResult(gameId);

        if (!game.isMultiplayer && !game.result) {
            const aiField: number[] = ai.pickNextMove(game);
            const aiMove: IMove = {
                char: getOtherChar(currentPlayer.char),
                field: aiField,
            };

            await gameModel.addMove(gameId, currentPlayer, aiMove);
            logger.info(`AI player made a move. Game ID: ${game.id}, AI player CHAR: ${aiMove.char}, Move: (${aiMove.field[0]}, ${aiMove.field[1]})`);

            game = await gameModel.updateResult(gameId);
        }

        if (game.result) {
            if (game.result.result === GameResult.win) {
                logger.info(`Game ${gameId} finished. Player ${game.result.winningChar} won.`);
            }
            else {
                logger.info(`Game ${gameId} finished with a draw.`);
            }
        }

        pubsub.publish(`game-${gameId}`, {
            game: {
                data: {
                    gameId: game.id,
                    status: game.status,
                    moves: game.moves,
                    result: game.result,
                    isMultiplayer: game.isMultiplayer,
                }
            }
        });

        return {
            gameId: game.id,
            status: game.status,
            moves: game.moves,
            result: game.result,
            isMultiplayer: game.isMultiplayer,
        };
    },
};

export { Mutation };