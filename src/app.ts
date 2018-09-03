import cookieParser from 'cookie-parser';
import express from 'express';
import proxy from 'proxy-middleware';
import rollbar from 'lib/rollbar';
import url from 'url';

const apolloUrl = url.parse(process.env.APOLLO_PROXY_URL || '');
const cookieDomain = process.env.APOLLO_PROXY_COOKIE_DOMAIN || '';

export default function initApp() {
  const app = express();

  app.use(rollbar.errorHandler());
  app.use(cookieParser());

  app.get('/boom', (req: express.Request, res: express.Response) => {
    rollbar.error('Test error');
    res.status(500).send('Just a test error');
  });

  app.get('/health', (req: express.Request, res: express.Response) => {
    res.sendStatus(200).end();
  });

  app.use(
    '/graphql',
    proxy(
      Object.assign({}, apolloUrl, {
        cookieRewrite: cookieDomain,
        pathname: '/graphql',
      }),
    ),
  );

  app.use(
    '/graphiql',
    proxy(
      Object.assign({}, apolloUrl, {
        cookieRewrite: cookieDomain,
        pathname: '/graphiql',
      }),
    ),
  );

  app.use((req: express.Request, res: express.Response) => {
    res.status(404).send('Not Found');
  });

  return app;
}
