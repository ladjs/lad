
import 'isomorphic-fetch';
import Frisbee from 'frisbee';

let server = require('../../src');

describe('server', () => {

  let api;

  before(done => {
    server = server.listen(8080, done);
  });

  after(done => server.close(done));

  it('should return 200 on /status', done => {

    api = new Frisbee(global._options);

    const opts = {};

    api.get('/status', opts).then(data => {
      expect(data.response).to.be.an('object');
      expect(data.body).to.be.an('object');
      expect(data.body.status).to.equal('online');
    }).then(done).catch(done);

  });

});
