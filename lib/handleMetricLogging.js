var _ = require('lodash');
exports.plugin = undefined;
var isMessageInStandardForm = function(msg){
  return msg.data && msg.data.data && msg.data.name;
}
var reportStandardFormMessage = function(msg){
  exports.plugin.plugins.metrics.add(msg.data.name, msg.data.data, function(err,result){
    if (err) exports.plugin.log(['hapi-metrics', 'error'], {msg: err});
    else exports.plugin.log(['hapi-metrics', 'info'], {msg: "Metric " + msg.data.name + " added"});
  });
};
var metricLogEventHandler = function(msg){
  if (!_.contains(msg.tags, 'add-metric')) return;
  isMessageInStandardForm(msg) ?  reportStandardFormMessage(msg) : undefined;
}

exports.activate = function(plugin){
  // will be called every time a logging statement is made
  exports.plugin = plugin;
  plugin.on('log', metricLogEventHandler);
}
