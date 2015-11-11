var MongoClient = require('mongodb').MongoClient;
var Hoek = require('hoek');
var _ = require('lodash');

var defaults = {
  collection: 'metrics',
  verbose: false,
  apiEnabled: false,
  apiEndpoint: '/api/metrics',
  apiAuth: null
};

exports.register = function(plugin, options, next) {

  var isMessageInStandardForm = function(msg){
    return msg.data && msg.data.data && msg.data.name;
  }
  var reportStandardFormMessage = function(msg){
    plugin.plugins.metrics.add(msg.data.name, msg.data.data, function(err,result){
      if (err) plugin.log(['hapi-metrics', 'error'], {msg: err});
    });
  };
  var metricLogEventHandler = function(msg){
    if (!_.contains(msg.tags, 'add-metric')) return;
    isMessageInStandardForm(msg) ?  reportStandardFormMessage(msg) : undefined;
  }
  // will be called every time a logging statement is made
  plugin.on('log', metricLogEventHandler);

  var settings = Hoek.clone(options);
  settings = Hoek.applyToDefaults(defaults, settings);

  var self = this;

  MongoClient.connect(settings.connectionUrl, function(err, db) {

    if (err) {
      return next(err);
    }
    self.db = db;

    self.collection = db.collection(settings.collection);

    plugin.expose('add', function(type, data, done) {

      var today = new Date();

      var metricObj = {
        type: type,
        data: data,
        date: today
      };
      self.collection.insert(metricObj, function(err, results) {
        if (typeof done !== 'function') {
          done = function() {};
        }
        if (err) {
          plugin.log(['metrics', 'error'], { error: err });
          return done(err);
        }
        if (settings.verbose) {
          plugin.log(['metrics', 'info'], metricObj);
        }
        done(null, results);
      });
    });
    plugin.expose('collection', function() {
      return self.collection;
    });

    if (settings.apiEnabled) {
      require('./api')(plugin, settings.apiEndpoint, settings.apiAuth, self.collection);
    }

    next();
  });
};

exports.register.attributes = {
  name: 'metrics',
  pkg: require('../package.json')
};
