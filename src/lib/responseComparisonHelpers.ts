import { includes, isEqualWith } from 'lodash';
import normalizeUrl from 'normalize-url';
import rollbar from 'lib/rollbar';
import statsd from 'lib/statsd';
import reqToCurl from 'lib/reqToCurl';

export default function logGraphqlResHitMissMismatch(
  newResult: object,
  oldResult: object,
  query: object,
  datadogKey: string,
  req: object,
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
    rollbar.debug(`${datadogKey} mismatch between new and old results`, {
      oldResult: JSON.stringify(oldResult),
      newResult: JSON.stringify(newResult),
      origQuery: JSON.stringify(query),
      reqToCurl: reqToCurl(req),
    });
  }
}

const createComparator = (): ((f: any, s: any, k?: any) => boolean | void) => {
  const urlFieldsToNormalize = [
    'profilePictureUrl',
    'profilePhotoUrl',
    'avatarUrl',
    'url',
    'contentUrl',
  ];
  const fieldsToIgnore = [
    'unreadMessagesCount',
    'queryKey',
    'subscribers_count',
    'memberships_count',
    'membershipsCount',
    'count',
  ];

  return (first: any, second: any, key?: any): boolean | void => {
    if (typeof first === 'string' && typeof second === 'string') {
      if (key && includes(urlFieldsToNormalize, key)) {
        const firstCdn = normalizeUrl(first);
        const secondCdn = normalizeUrl(second);
        return firstCdn === secondCdn;
      }
    }

    if (key === 'lastReadSequence' && !!first && !!second) {
      return true;
    }

    if (key && includes(fieldsToIgnore, key)) {
      return true;
    }

    return undefined;
  };
};
