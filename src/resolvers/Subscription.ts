import { IGame, IPlayer } from '../model/game.model';

const Subscription = {
    game: {
        async subscribe(parent, args, { pubsub, gameModel, logger }, info) {
            const gameId: string = args.data.gameId;
            const playerId: string = args.data.playerId;

            const game: IGame = await gameModel.getGameById(gameId);

            if (!game) {
                throw new Error(`Game ${gameId} not found`);
            }

            const gamePlayer: IPlayer = game.players.find(player => player.id === playerId);

            if (!gamePlayer) {
                throw new Error(`Player ${playerId} not found on game ${gameId}.`);
            }

            logger.info(`Player subscribe to a game log. Game ID: ${gameId}, Player ID: ${playerId}`);

            return pubsub.asyncIterator(`game-${gameId}`);
        }
    }
};

export { Subscription as default };