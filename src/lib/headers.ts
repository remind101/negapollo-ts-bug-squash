/**
 * Headers we have at Remind.
 *
 * See https://github.com/remind101/r101-router
 *
 * We make them all lowercase here because they're case insensitive and this
 * makes it safe to index in the `request.headers` hash.
 */

// serial integer ID
export const USER_ID_HEADER = 'R101-Auth-User-Id'.toLowerCase();

export const REQUEST_ID_HEADER = 'X-Request-Id'.toLowerCase();

export const FORCE_V2_CLASS_DEPROXY_HEADER = 'X-Force-V2-Class-Graphql-Deproxy'.toLowerCase();
