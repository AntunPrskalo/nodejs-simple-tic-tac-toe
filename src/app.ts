import { GraphQLServer, PubSub } from 'graphql-yoga';
import { GameModel } from './model/game.model';
import { Mutation } from './resolvers/Mutation';
import { Query } from './resolvers/Query';
import Subscription from './resolvers/Subscription';
import { InMemoryStorage } from './storage/InMemoryStorage';
import { RandomAI } from './helpers/randomAI';
import winston, { format } from 'winston';

const { combine, timestamp, printf } = format;
const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console()
    ],
    format: combine(
        timestamp(),
        myFormat
    ),
});

const pubsub = new PubSub();

const storage = InMemoryStorage.getInstance();
const gameModel = new GameModel(storage);

const ai = new RandomAI();



const server = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers: {
        Mutation,
        Query,
        Subscription
    },
    context(request) {
        return {
            gameModel,
            pubsub,
            ai,
            logger,
        };
    }
});

server.start().then((result) => {
    logger.info('GraphQL server is running.');
}).catch((error) => {
    logger.error(error);
});