/* global describe,before,after,expect,it,beforeEach */
exports.lab = require('lab-bdd')(require('lab'));
var Hapi = require('hapi');
var MongoClient = require('mongodb').MongoClient;

var mongoUrl = 'mongodb://localhost:27017/metric-test';

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
        connectionUrl: mongoUrl
      }
    }, function() {
      MongoClient.connect(mongoUrl, function(err, _db) {
        db = _db;
        done();
      });
    });

  });

  beforeEach(function(done) {
    db.dropDatabase(done);
  });

  it('should add to db', function(done) {
    server.plugins.metrics.add('type', { name: 'Bob' }, function(err, result) {
      var metric = result.metric;
      expect(err).to.equal(null);
      expect(result.result.ok).to.equal(1);

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
