import request from 'supertest';

import makeApp from 'app';

describe('the proxy', () => {
  const app = makeApp();

  it('handles 404s', () => {
    return request(app)
      .get('/wow_a_404')
      .expect(404, 'Not Found');
  });

  it('goes boom', () => {
    return request(app)
      .get('/boom')
      .expect(500, 'Just a test error');
  });
});
