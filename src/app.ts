import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import proxy from 'http-proxy-middleware';
import rollbar from 'lib/rollbar';
import url from 'url';
import { restream, recordProxyResult } from 'lib/diffHandlers';

export const apolloUrl = 'https://www.classchirp.com';
const cookieDomain = '.classchirp.com';

export default function initApp() {
  const app = express();

  app.use(rollbar.errorHandler());
  app.use(cookieParser());

  // using /boom will prevent us from testing /boom on r101-apollo
  app.get('/negboom', (req: express.Request, res: express.Response) => {
    rollbar.error('Test error');
    res.status(500).send('Just a test error');
  });

  app.get('/health', (req: express.Request, res: express.Response) => {
    res.sendStatus(200).end();
  });

  app.use(bodyParser.json());

  app.post('/graphql', (req, res, next) => {
    res.locals.originalBody = req.body;
    next();
  });

  app.post(
    '/graphql',
    proxy({
      target: url.format(apolloUrl),
      changeOrigin: true,
      cookieDomainRewrite: cookieDomain,
      onProxyReq: restream,
      onProxyRes: recordProxyResult,
    }),
  );

  // Everything else gets passed to apollo
  app.all(
    '*',
    proxy({
      target: url.format(apolloUrl),
      changeOrigin: true,
      cookieDomainRewrite: cookieDomain,
    }),
  );

  return app;
}
