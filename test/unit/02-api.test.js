
let server = require('../../lib/api');

describe('api', () => {

  before(done => {
    server = server.listen(0, done);
  });

  after(done => server.close(done));

  it('should return 404 on GET /', async () => {
    const api = new global.Frisbee({
      ...global._options,
      baseURI: `http://localhost:${server.address().port}`
    });
    const res = await api.get('/');
    expect(res.status).to.equal(404);
  });

});
