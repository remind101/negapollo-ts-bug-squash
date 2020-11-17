import dotenv from 'dotenv';
import initApp from 'app';

const GRAPHQL_PORT = process.env.PORT || 8081;

const env = process.env.NODE_ENV || 'no-env';

if (env === 'development') {
  console.log('Setting up dev environment...');
  dotenv.config({ path: '.env.development' });

  // Resolves DNS cert issues just when we're in dev mode
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
}

const app = initApp();

app.listen(GRAPHQL_PORT, () =>
  console.log(
    'Negapollo proxy server is now running on http://localhost:' + GRAPHQL_PORT + ' as ' + env,
  ),
);
