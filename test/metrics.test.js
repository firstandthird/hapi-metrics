var MongoClient = require('mongodb').MongoClient;
var Code = require('code');   // assertion library
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Hapi = require('hapi');
var metrics = require("../");

lab.experiment('hapi-metrics', function() {
  var server;
  var metric;
  var url = 'mongodb://localhost:27017/metric-test';

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
        connectionUrl: url
      }
    }, function (err) {
      if (err) {
        console.log(err)
      }
      MongoClient.connect(url, function(err, _db) {
       db = _db;
        server.start(function(err){
          if (err) console.log(err)
          done();
        });
      });
    });
  });
  lab.beforeEach(function(done) {
     db.dropDatabase(done);
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
        server.plugins.metrics.collection().find().toArray(function(err, metrics) {
           Code.expect(metrics.length).to.equal(1);
           done();
         });
      });
    });
  });
});
