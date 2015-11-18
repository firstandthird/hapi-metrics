var _ = require('lodash');

module.exports = function(plugin){
  // will be called every time a logging statement is made
  exports.plugin = plugin;
  var reportStandardFormMessage = function(msg){
    exports.plugin.plugins.metrics.add(msg.data.name, msg.data.data, function(err,result){
      if (err) exports.plugin.log(['hapi-metrics', 'error'], {msg: err});
      else exports.plugin.log(['hapi-metrics', 'info'], {msg: "Metric " + msg.data.name + " added"});
    });
  };
  plugin.on('log', function(msg){
    if (!_.contains(msg.tags, 'add-metric')) return;
    (msg.data && msg.data.data && msg.data.name) ?  reportStandardFormMessage(msg) : undefined;
  });
}
