import request from 'supertest';

import makeApp from 'app';

describe('the proxy', () => {
  const app = makeApp();

  it('goes boom', () => {
    return request(app)
      .get('/negboom')
      .expect(500, 'Just a test error');
  });
});
