import Rollbar from 'rollbar';

export default new Rollbar({
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  environment: process.env.ROLLBAR_ENVIRONMENT,
  endpoint: process.env.ROLLBAR_ENDPOINT,
  captureUncaught: process.env.NODE_ENV !== 'development',
  captureUnhandledRejections: process.env.NODE_ENV !== 'development',
  /** log to console out in dev/staging (what I really want) and sumo in production */
  verbose: true,
});
