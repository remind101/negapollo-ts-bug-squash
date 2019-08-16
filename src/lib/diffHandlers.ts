import logGraphqlResHitMissMismatch from 'lib/responseComparisonHelpers';
import rollbar from 'lib/rollbar';
import rp from 'request';
import statsd from 'lib/statsd';
import url from 'url';
import zlib from 'zlib';

import { FORCE_V2_CLASS_DEPROXY_HEADER } from 'lib/headers';
import { logRequestReceived } from 'lib/requestLogging';

const darkLaunchHost = 'r101-apollo.empire';
const darkLaunchProtocol = 'http';

// restream parsed body before proxying
export const restream = function(proxyReq, req, res, options) {
  if (req.body) {
    statsd.increment('negapollo.restream.start');
    logRequestReceived(req, req.body);
    const bodyData = JSON.stringify(req.body);
    // incase if content-type is application/x-www-form-urlencoded -> we need to change to application/json
    proxyReq.setHeader('Content-Type', 'application/json');
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
    // stream the content
    proxyReq.write(bodyData);
    proxyReq.end();
  }
};

export const recordProxyResult = function(proxyRes, req, res) {
  // The event handlers for 'data' and end events that are used to
  // store the request body for diffing hook into every request event.
  // As a result, they are also triggered when the asynchronous deproxied
  // graphql query is made. The event handlers are only intended to log the
  // data needed to make a deproxied request and diff the two graphql
  // responses, so the early return below is used to stop the event
  // handlers from being used when making a deproxied request.
  if (req.headers[FORCE_V2_CLASS_DEPROXY_HEADER]) {
    return;
  }
  statsd.increment('negapollo.record_proxy_result.start');

  let oldResponseBuffer = Buffer.from([]);

  proxyRes.on('data', data => {
    oldResponseBuffer = Buffer.concat([oldResponseBuffer, data]);
  });

  proxyRes.on('end', () => {
    const origUrl = url.parse(req.originalUrl);
    const fullUrl = url.format({
      protocol: darkLaunchProtocol,
      host: darkLaunchHost,
      pathname: origUrl.pathname,
    });

    process.nextTick(() => {
      // Check for compressed (gzipped) response, and handle it
      // if needed
      if (proxyRes.headers['content-encoding']) {
        zlib.unzip(oldResponseBuffer, (inflateError, inflated) => {
          if (inflateError) {
            rollbar.error(
              'negapollo.record_proxy_result failed to decompress compressed request response',
              {
                error: inflateError,
              },
            );
          } else if (isChatQuery(res.locals.originalBody)) {
            requestAndLogQuery(fullUrl, req, res, inflated);
          }
        });
      } else if (isChatQuery(res.locals.originalBody)) {
        requestAndLogQuery(fullUrl, req, res, oldResponseBuffer);
      }
    });
  });
};

const requestAndLogQuery = (fullUrl: string, req: any, res: any, responseBuffer: Buffer): void => {
  statsd.increment('negapollo.request_and_log_query.start');
  makeDarkLaunchRequest(fullUrl, req, res, (error, resp, body) => {
    if (error) {
      rollbar.error('negapollo.request_and_log_query failed to make dark launch query', {
        error,
      });
    }
    const oldResponse = responseBuffer.toString();
    logDiff(body, oldResponse, res.locals.originalBody, req);
  });
};

const isChatQuery = (body: Object): boolean => {
  const queryString = JSON.stringify(body);
  return queryString.search(/chats/i) !== -1;
};

export const makeDarkLaunchRequest = (
  queryUrl: string,
  req: any,
  res: any,
  callback: rp.RequestCallback,
) => {
  statsd.increment('negapollo.make_dark_launch_request.start');

  const deproxyHeaders = Object.assign({}, req.headers);
  deproxyHeaders[FORCE_V2_CLASS_DEPROXY_HEADER] = '1';
  rp(
    {
      uri: queryUrl,
      gzip: true, // TODO: make this less hard-coded
      method: req.method,
      headers: deproxyHeaders,
      body: JSON.stringify(res.locals.originalBody),
    },
    callback,
  );
};

export const logDiff = (
  response: string,
  oldResponse: string,
  query: object,
  req: object,
): void => {
  statsd.increment('negapollo.log_result_diff.start');
  let parsedResponse;

  try {
    parsedResponse = JSON.parse(response);
    statsd.increment('negapollo.log_result_diff.parse_dark_launch_query.success');
  } catch (err) {
    statsd.increment('negapollo.log_result_diff.parse_dark_launch_query.failure');
    rollbar.error('negapollo.log_result_diff failed to parse dark launch query result', {
      error: err,
    });
    return;
  }

  try {
    const parsedOldResponse = JSON.parse(oldResponse);
    statsd.increment('negapollo.log_result_diff.parse_original_query.success');
    logGraphqlResHitMissMismatch(
      parsedResponse,
      parsedOldResponse,
      query,
      'negapollo.log_result_diff.compare_response_bodies',
      req,
    );
  } catch (err) {
    statsd.increment('negapollo.log_result_diff.parse_original_query.failure');
    rollbar.error('negapollo.log_result_diff failed to parse original query result', {
      error: err,
    });
  }
};
