const express = require('express');
const rollbar = require('lib/rollbar');

const GRAPHQL_PORT = process.env.PORT || 8080;

function initApp() {
  const app = express();

  app.get('/', (req, res) => res.send('Hello world'));
  app.use(rollbar.errorHandler());

  app.use('/boom', (req: express$Request, res: express$Response, next: express$NextFunction) => {
    rollbar.error('Test error');
    res.end();
    next();
  });

  if (process.env.NODE_ENV === 'staging') {
    app.use('/leak', (req: express$Request, res: express$Response, next: express$NextFunction) => {
      causeLeak();
      next();
    });
  }

  app.use((req: express$Request, res: express$Response) => {
    res.status(404).send('Not Found');
  });

  return app;
}

const app = initApp();

app.listen(GRAPHQL_PORT, () => console.log(`blah`));
