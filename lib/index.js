var MongoClient = require('mongodb').MongoClient;
var Hoek = require('hoek');

var defaults = {
  collection: 'metrics'
};

exports.register = function(plugin, options, next) {

  var settings = Hoek.clone(options);
  settings = Hoek.applyToDefaults(defaults, settings);

  var self = this;

  MongoClient.connect(settings.connectionUrl, function(err, db) {
    self.db = db;

    self.collection = db.collection(settings.collection);

    plugin.expose('add', function(type, data, done) {

      var today = new Date();
      today.setHours(0, 0, 0, 0);

      self.collection.insert({
        type: type,
        data: data,
        date: today
      }, function(err, results) {
        if (typeof done === 'function') {
          if (err) {
            return done(err);
          }
          done(null, results);
        }
      });
    });

    plugin.expose('collection', function() {
      return self.collection;
    });

    next();
  });
};

exports.register.attributes = {
  name: 'metrics',
  pkg: require('../package.json')
};
