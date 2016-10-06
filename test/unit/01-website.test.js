
let server = require('../../lib/web');

describe('website', () => {

  before(done => {
    server = server.listen(0, done);
  });

  after(done => server.close(done));

  it('should return 200 on GET /status', async () => {
    const api = new global.Frisbee({
      ...global._options,
      baseURI: `http://localhost:${server.address().port}`
    });
    const res = await api.get('/status');
    expect(res.body).to.be.an('object');
    expect(res.body.status).to.equal('online');
  });

});
