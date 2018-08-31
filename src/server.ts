import express from 'express';
import rollbar from 'lib/rollbar';

const GRAPHQL_PORT = process.env.PORT || 8080;

function initApp() {
  const app = express();

  app.get('/', (req, res) => res.send('Hello world'));
  app.use(rollbar.errorHandler());

  // TODO: add health endpoint

  app.use('/boom', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    rollbar.error('Test error');
    res.end();
    next();
  });

  app.use((req: express.Request, res: express.Response) => {
    res.status(404).send('Not Found');
  });

  return app;
}

const app = initApp();

app.listen(GRAPHQL_PORT, () => console.log(`blah`));
