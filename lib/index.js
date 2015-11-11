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

  // handlers for reporting the different formats of incoming log messages
  // this can be expanded to support an api-like interface via logging statements
  var MessageHandlers = {
    add : function(loggedMsg, done){
      plugin.plugins.metrics.add(loggedMsg.data.name, loggedMsg.data.data, done);
    },
    remove : function(loggedMsg, done){
      plugin.plugins.metrics.add(loggedMsg.data.name, loggedMsg.data.data, done);
    }
  };
  var appropriateHandlerForMessageFormat = function(loggedMsg){
    if (_.contains(loggedMsg.tags, 'add-metric')){
      if (loggedMsg.data && loggedMsg.data.data && loggedMsg.data.name)
        return MessageHandlers.add;
    }
    if (_.contains(loggedMsg.tags, 'remove-metric')){
    }
  };

  var done = function(err,savedMsgObj){
    if (err) plugin.log(['hapi-metrics', 'error'], {msg: err});
  }

  var handleLoggedMsg = function(loggedMsg){
    var handler = appropriateHandlerForMessageFormat(loggedMsg);
    var done = loggedMsg.data.callback ? loggedMsg.data.callback : done;
    if (handler)
      handler(loggedMsg, done);
  };
  var logEventHandler = function(loggedMsg){
    if (!_.contains(loggedMsg.tags, 'metrics')) return;
    handleLoggedMsg(loggedMsg);
  }
  // will be called every time a logging statement is made
  plugin.on('log', logEventHandler);

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
