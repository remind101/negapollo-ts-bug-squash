import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import logGraphqlResHitMissMismatch from 'lib/responseComparisonHelpers';
import proxy from 'http-proxy-middleware';
import rollbar from 'lib/rollbar';
import rp from 'request-promise-native';
import statsd from 'lib/statsd';
import url from 'url';

import { FORCE_DEPROXY_HEADER } from 'lib/headers';
import { logRequestReceived } from 'lib/requestLogging';

export const apolloUrl = url.parse(process.env.APOLLO_PROXY_URL || 'https://www.classchirp.com');
const cookieDomain = process.env.APOLLO_PROXY_COOKIE_DOMAIN || '.classchirp.com';

export default function initApp() {
  const app = express();

  const diffHandlers = {
    body: null,
    oldResponse: null,
    newResponse: null,
    recordRequestBody(proxyReq, req, res) {
      // The event handlers for 'data' and end events that are used to
      // store the request body for diffing hook into every request event.
      // As a result, they are also triggered when the asynchronous deproxied
      // graphql query is made. The event handlers are only intended to log the
      // data needed to make a deproxied request and diff the two graphql
      // responses, so the early return below is used to stop the event
      // handlers from being used when making a deproxied request.
      if (req.headers[FORCE_DEPROXY_HEADER]) {
        return;
      }
      console.log('negapollo.record_request_body.start_of_func');

      this.body = Buffer.from('');

      req.on('data', data => {
        statsd.increment('negapollo.record_request_body.on_data');
        this.body = Buffer.concat([this.body, data]);
      });

      req.on('end', data => {
        statsd.increment('negapollo.record_request_body.on_end');
        this.body = this.body.toString();
        logRequestReceived(req, this.body);
      });
    },
    recordProxyResult(proxyRes, req, res) {
      // The event handlers for 'data' and end events that are used to
      // store the request body for diffing hook into every request event.
      // As a result, they are also triggered when the asynchronous deproxied
      // graphql query is made. The event handlers are only intended to log the
      // data needed to make a deproxied request and diff the two graphql
      // responses, so the early return below is used to stop the event
      // handlers from being used when making a deproxied request.
      if (req.headers[FORCE_DEPROXY_HEADER]) {
        return;
      }

      this.oldResponse = Buffer.from('');

      proxyRes.on('data', data => {
        statsd.increment('negapollo.record_proxy_result.on_data');
        this.oldResponse = Buffer.concat([this.oldResponse, data]);
      });

      proxyRes.on('end', () => {
        statsd.increment('negapollo.record_proxy_result.on_end');
        const rawOldRes = this.oldResponse.toString();

        try {
          this.oldResponse = JSON.parse(rawOldRes);
        } catch (err) {
          // JSON response parse errors are already logged by apollo, so
          // not going to log here.
        }

        const fullUrl = url.format({
          protocol: req.protocol,
          host: req.get('host'),
          pathname: req.originalUrl,
        });
        setTimeout(() => this.logDiff(fullUrl, req), 10);
      });
    },
    logDiff(queryUrl, req) {
      const deproxyHeaders = Object.assign({}, req.headers);
      deproxyHeaders[FORCE_DEPROXY_HEADER] = '1';
      statsd.increment('negapollo.log_diff.start');

      rollbar.debug('negapollo.log_result_diff.sending_dark_launch_request', {
        uri: queryUrl,
      });

      return rp({
        uri: queryUrl,
        method: req.method,
        headers: deproxyHeaders,
        body: this.body,
      })
        .then(response => {
          try {
            this.newResponse = JSON.parse(response);
            logGraphqlResHitMissMismatch(
              this.newResponse,
              this.oldResponse,
              'negapollo.log_result_diff.compare_response_bodies',
            );
          } catch (err) {
            rollbar.debug('negapollo.log_result_diff failed to parse dark launch query result', {
              error: err,
            });
          }
        })
        .catch(error => {
          rollbar.debug('negapollo.log_result_diff failed to make dark launch query', {
            error,
          });
        });
    },
  };

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
    proxy({
      target: apolloUrl,
      changeOrigin: true,
      cookieDomainRewrite: cookieDomain,
      onProxyReq: diffHandlers.recordRequestBody.bind(diffHandlers),
      onProxyRes: diffHandlers.recordProxyResult.bind(diffHandlers),
    }),
  );

  app.use(
    '/graphiql',
    proxy({
      target: apolloUrl,
      changeOrigin: true,
      cookieDomainRewrite: cookieDomain,
      onProxyReq: diffHandlers.recordRequestBody.bind(diffHandlers),
      onProxyRes: diffHandlers.recordProxyResult.bind(diffHandlers),
    }),
  );

  app.use((req: express.Request, res: express.Response) => {
    res.status(404).send('Not Found');
  });

  return app;
}
