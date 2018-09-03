import dotenv from 'dotenv';
import initApp from 'app';

const GRAPHQL_PORT = process.env.PORT || 8080;

const env = process.env.NODE_ENV || 'no-env';

if (env === 'development') {
  dotenv.config({ path: '.env.development' });
}

const app = initApp();

app.listen(GRAPHQL_PORT, () =>
  console.log(
    'Negapollo proxy server is now running on http://localhost:' + GRAPHQL_PORT + ' as ' + env,
  ),
);
