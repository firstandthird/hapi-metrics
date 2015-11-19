var _ = require('lodash');

module.exports = function(plugin, metricsReportTag){
  // will be called every time a logging statement is made
  var reportStandardFormMessage = function(msg){
    plugin.plugins.metrics.add(msg.data.name, msg.data.data, function(err,result){
      if (err) plugin.log(['hapi-metrics', 'error'], {msg: err});
      else plugin.log(['hapi-metrics', 'info'], {msg: "Metric " + msg.data.name + " added"});
    });
  };
  plugin.on('log', function(msg){
    if (!_.contains(msg.tags, metricsReportTag)) return;
    if (msg.data && msg.data.data && msg.data.name) reportStandardFormMessage(msg);
  });
}
