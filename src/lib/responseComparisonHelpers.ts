import { isEqualWith } from 'lodash';
// import normalizeUrl from 'normalize-url';
// import rollbar from 'lib/rollbar';
// import statsd from 'lib/statsd';
import reqToCurl from 'lib/reqToCurl';

export default function logGraphqlResHitMissMismatch(
  newResult: object,
  oldResult: object,
  query: object,
  datadogKey: string,
  req: object,
): void {
  if (!oldResult && !newResult) {
    console.log('match');
  } else if (!oldResult && newResult) {
    console.log(`mismatch between new and old results: ${oldResult} ${newResult}`);
  } else if (!newResult && oldResult) {
    console.log(`mismatch between new and old results: ${oldResult} ${newResult}`);
  } else if (isEqualWith(newResult, oldResult, createClassComparator())) {
    console.log('match');
  } else {
    console.log(`mismatch between new and old results`, {
      oldResult: JSON.stringify(oldResult),
      newResult: JSON.stringify(newResult),
      origQuery: JSON.stringify(query),
      reqToCurl: reqToCurl(req),
    });
  }
}

const createClassComparator = (): ((f: any, s: any, k?: any) => boolean | void) => {
  return;
};
