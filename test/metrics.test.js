/* global describe,before,after,expect,it,beforeEach */
exports.lab = require('lab-bdd')(require('lab'));
var Hapi = require('hapi');
var MongoClient = require('mongodb').MongoClient;


describe('metrics', function() {
  var server;

  var db;

  before(function(done) {
    server = new Hapi.Server();
    server.on('internalError', function (request, err) {
      console.log('ERROR', err.message);
    });
    server.pack.register({
      plugin: require('../'),
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
