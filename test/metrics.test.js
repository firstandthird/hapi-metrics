var Code = require('code');   // assertion library
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Hapi = require('hapi');
var metrics = require("../");

lab.experiment('hapi-metrics', function() {
  var server;
  var metric;
  lab.before(function(done) {
    server = new Hapi.Server({
      debug: {
        log: ['hapi-metrics', 'error'],
        request: ['tail', 'error']
      }
    });
    server.connection();
    server.register({
      register : metrics,
      options: {
        handleMetricLogs : true,
        connectionUrl: 'mongodb://localhost:27017/metric-test'
      }
    }, function (err) {
      if (err) {
        console.log(err)
      }
      server.start(function(err){
        if (err) console.log(err)
        done();
      });
    });
  });

  lab.test(' adds to db', function(done){
    server.plugins.metrics.add('type', { name: 'Bob' }, function(err, metric) {
      metric = metric.ops[0];
      Code.expect(err).to.equal(null);
      Code.expect(metric.type).to.equal('type');
      Code.expect(metric.data).to.deep.equal({ name: 'Bob' });
      server.plugins.metrics.collection().findOne({ _id: metric._id }, function(err, result) {
        Code.expect(err).to.equal(null);
        Code.expect(result.type).to.equal('type');
        Code.expect(result.data).to.deep.equal({ name: 'Bob' });
        Code.expect(result.date).to.not.equal(undefined);
        done();
      });
    });
  });
  lab.test(' finds it back', function(done){
    // server.plugins.metrics.collection().findOne({ _id: metric._id }, function(err, result) {
    //   Code.expect(err).to.equal(null);
    //   Code.expect(result.type).to.equal('type');
    //   Code.expect(result.data).to.deep.equal({ name: 'Bob' });
    //   Code.expect(result.date).to.not.equal(undefined);
      done();
    // });
  });

});


/*
describe('metrics', function() {
  var server;

  var db;

  before(function(done) {
    server = new Hapi.Server();
    server.on('internalError', function (request, err) {
      console.log('ERROR', err.message);
    });
    server.register({
      plugin : metrics,
      options: {
        connectionUrl: 'mongodb://localhost:27017/metric-test'
      }
    }, function() {
      MongoClient.connect('mongodb://localhost:27017/metric-test', function(err, _db) {
        db = _db;
        done();
      });
    });

  });

  beforeEach(function(done) {
    db.dropDatabase(done);
  });

  it('should add to db', function(done) {
    server.plugins.metrics.add('type', { name: 'Bob' }, function(err, metric) {
      metric = metric[0];
      expect(err).to.equal(null);
      expect(metric.type).to.equal('type');
      expect(metric.data).to.deep.equal({ name: 'Bob' });

      server.plugins.metrics.collection().findOne({ _id: metric._id }, function(err, result) {
        expect(err).to.equal(null);
        expect(result.type).to.equal('type');
        expect(result.data).to.deep.equal({ name: 'Bob' });
        expect(result.date).to.not.equal(undefined);

        server.plugins.metrics.collection().find().toArray(function(err, metrics) {
          expect(metrics.length).to.equal(1);
          done();
        });
      });
    });
  });
});
*/
