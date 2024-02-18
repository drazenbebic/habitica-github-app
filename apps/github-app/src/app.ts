import express, { Router } from 'express';
import * as dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { HTTPError } from './utils';
import v1OAuthRouter from './routes/v1/oauth.router';
import v1WebhookRouter from './routes/v1/webhook.router';
import process from 'process';
import loggerMiddleware from './middlewares/logger.middleware';

const app = express();

// Loading the environment
dotenv.config({ path: '../../.env' });

// Handling uncaught exceptions
process.on('uncaughtException', error => {
  console.log(`Error: ${error.message}`);
  console.log('Shutting down the server due to an uncaught exception');
  process.exit(1);
});

// Load body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Load logger middleware
app.use(loggerMiddleware);

// Load cookie parser
app.use(cookieParser());

// Expose basedir
app.locals.basedir = './';

// Route definition
const routes: { [key: string]: { [key: string]: Router } } = {
  v1: {
    oauth: v1OAuthRouter,
    webhooks: v1WebhookRouter,
  },
};

// Loading up the middleware
app.use(cors());

// Handle main GET route
app.get('/', (request, response) => {
  response.status(200).json({
    success: true,
    message: 'Habitica GitHub API',
    data: null,
  });
});

// Load the routes
for (const prefix in routes) {
  for (const name in routes[prefix]) {
    app.use(`/${prefix}`, routes[prefix][name]);
  }
}

// Handle unhandled routes
app.all('*', (request, response, next) => {
  next(new HTTPError(`${request.originalUrl} route not found.`, 404));
});

const PORT = process.env.PORT;

const server = app.listen(PORT, () => {
  console.log(
    `Server started on port ${PORT} in ${process.env.NODE_ENV} mode.`,
  );
});

// Handling unhandled promise rejections
process.on('unhandledRejection', (error: { message: string }) => {
  console.log(`Error: ${error.message}`);
  console.log(
    'Shutting down the server due to an unhandled promise rejection.',
  );
  server.close(() => {
    process.exit(1);
  });
});
