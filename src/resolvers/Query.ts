import { IGame, IPlayer, Status } from '../model/game.model';

const Query = {
    async getHistory(parent, args, { gameModel, logger }, info) {
        const gameId: string = args.data.gameId;
        const playerId: string = args.data.playerId;
        let games: IGame[] = [];

        if (gameId) {
            const game: IGame = await gameModel.getGameById(gameId);

            if (game && game.status === Status.finished) {
                const gamePlayer: IPlayer = game.players.find(player => player.id === player.id);

                if (gamePlayer) {
                    games.push(game);
                }
            }
        }
        else {
            games = await gameModel.findFinishedGamesByPlayer(playerId);
        }

        logger.info(`Fetching history for player. Player ID: ${playerId}`);

        return games;
    },
};

export { Query };