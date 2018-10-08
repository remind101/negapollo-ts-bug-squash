import { isEqual } from 'lodash';
import rollbar from 'lib/rollbar';
import statsd from 'lib/statsd';

export default function logGraphqlResHitMissMismatch(
  newResult: object,
  oldResult: object,
  datadogKey: string,
): void {
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
