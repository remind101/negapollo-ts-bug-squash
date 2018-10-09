import express from 'express';
import statsd from 'lib/statsd';

import { USER_ID_HEADER, REQUEST_ID_HEADER } from 'lib/headers';
import { sortedUniq } from 'lodash';

export function logRequestReceived(req: express.Request, body) {
  statsd.increment('negapollo.inbound_requests');
  console.log(
    'at=negapollo_request_received' +
      ` rid=${req.headers[REQUEST_ID_HEADER] || '?'}` +
      ` user_id=${req.headers[USER_ID_HEADER] || '?'}` +
      ` operationName=${getOperationNamesFromRequest(req, body)}`,
  );
}

export function getOperationName(body: any): string | null {
  if (!body) {
    return null;
  }

  if (body.operationName) {
    return body.operationName;
  }
  let parsedBody = body;
  if (typeof body === 'string') {
    try {
      parsedBody = JSON.parse(body);
    } catch (e) {
      return null;
    }
  }
  if (parsedBody && parsedBody.query && parsedBody.query.match) {
    const match = parsedBody.query.match(/(query|mutation) (\w+).* {/);
    if (match) {
      return match[2];
    }
  }
  return null;
}

export function getOperationNamesFromRequest(request: express.Request, body): string {
  if (Array.isArray(body)) {
    const operationNames = body.map(getOperationName);
    return sortedUniq(operationNames.sort()).join(','); // normalize
  }
  return getOperationName(body) || request.originalUrl;
}
