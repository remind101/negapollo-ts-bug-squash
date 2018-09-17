import express from 'express';
import { isEqual } from 'lodash';
import { logRequestReceived } from 'lib/requestLogging';
import rollbar from 'lib/rollbar';
import rp from 'request-promise-native';
import statsd from 'lib/statsd';
import url from 'url';

export default function logGraphqlResHitMissMismatch(newResult, oldResult, datadogKey): void {
  if (!oldResult && !newResult) {
    statsd.increment(`${datadogKey}.match`);
  } else if (!oldResult && newResult) {
    statsd.increment(`${datadogKey}.mismatch`);
    rollbar.debug(`${datadogKey} mismatch between new and old results`, { oldResult, newResult });
  } else if (!newResult && oldResult) {
    statsd.increment(`${datadogKey}.miss`);
  } else if (isEqual(newResult, oldResult)) {
    statsd.increment(`${datadogKey}.match`);
  } else {
    statsd.increment(`${datadogKey}.mismatch`);
    rollbar.debug(`${datadogKey} mismatch between new and old results`, { oldResult, newResult });
  }
}
