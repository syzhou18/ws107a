const app = require('./koa');
const server = app.listen();
const request = require('supertest').agent(server);

describe('test', function() {
  after(function() {
    server.close();
  });

  it('/hello should say "你好"', function(done) {
    request
    .get('/hello')
    .expect(200)
    .expect('你好', done);
  });
  it('/name should say "周聖洋"', function(done) {
    request
    .get('/name')
    .expect(200)
    .expect('周聖洋', done);
  });
  it('/id should say "110510510"', function(done) {
    request
    .get('/id')
    .expect(200)
    .expect('110510510', done);
  });
  it('/xxx/yyy should say "404"', function(done) {
    request
    .get('/xxx/yyy')
    .expect(404,done)
  });
});