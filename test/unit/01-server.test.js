
let server = require('../../lib');

describe('website', () => {

  before(done => {
    server = server.listen(8080, done);
  });

  after(done => server.close(done));

  it('should return 200 on GET /status', async () => {
    const api = new global.Frisbee(global._options);
    const res = await api.get('/status');
    expect(res.body).to.be.an('object');
    expect(res.body.status).to.equal('online');
  });

});
