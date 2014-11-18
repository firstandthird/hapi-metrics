var MongoClient = require('mongodb').MongoClient;
var Hoek = require('hoek');
var async = require('async');

var defaults = {
  collection: 'Metrics',
  aggregateCollection: 'MetricAggregate'
};

exports.register = function(plugin, options, next) {

  var settings = Hoek.clone(options);
  settings = Hoek.applyToDefaults(defaults, settings);

  var self = this;

  MongoClient.connect(settings.connectionUrl, function(err, db) {
    self.db = db;

    self.collection = db.collection(settings.collection);
    self.aggregateCollection = db.collection(settings.aggregateCollection);

    plugin.expose('add', function(type, data, done) {

      var today = new Date();
      today.setHours(0, 0, 0, 0);

      async.parallel([
        function(done) {
          self.collection.insert({
            type: type,
            data: data,
            date: today
          }, done);
        },
        function(done) {
          var key = 'days.'+today.getTime();
          var inc = {};
          inc[key] = 1;
          inc.total = 1;
          self.aggregateCollection.update({
            type: type
          }, {
            $inc: inc
          }, {
            upsert: true
          }, done);
        }
      ], function(err, results) {
        if (typeof done === 'function') {
          if (err) {
            return done(err);
          }
          done(null, results[0]);
        }
      });
    });

    plugin.expose('collection', function() {
      return self.collection;
    });

    plugin.expose('aggregateCollection', function() {
      return self.aggregateCollection;
    });

    next();
  });
};

exports.register.attributes = {
  name: 'metrics',
  pkg: require('../package.json')
};
