import { includes, isEqualWith } from 'lodash';
import normalizeUrl from 'normalize-url';
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
  } else if (isEqualWith(newResult, oldResult, createComparator())) {
    statsd.increment(`${datadogKey}.match`);
  } else {
    statsd.increment(`${datadogKey}.mismatch`);
    rollbar.debug(`${datadogKey} mismatch between new and old results`, { oldResult, newResult });
  }
}

const createComparator = (): ((f: any, s: any, k?: any) => boolean | void) => {
  const urlFieldsToNormalize = ['profilePictureUrl', 'avatarUrl'];
  return (first: any, second: any, key?: any): boolean | void => {
    if (typeof first === 'string' && typeof second === 'string') {
      if (key && includes(urlFieldsToNormalize, key)) {
        const firstCdn = normalizeUrl(first);
        const secondCdn = normalizeUrl(second);
        return firstCdn === secondCdn;
      }
    }
    return undefined;
  };
};
