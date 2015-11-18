var _ = require('lodash');
exports.plugin = undefined;

module.exports = function(plugin){
  exports.plugin = plugin;
  var reportStandardFormMessage = function(msg){
    exports.plugin.plugins.metrics.add(msg.data.name, msg.data.data, function(err,result){
      if (err) exports.plugin.log(['hapi-metrics', 'error'], {msg: err});
      else exports.plugin.log(['hapi-metrics', 'info'], {msg: "Metric " + msg.data.name + " added"});
    });
  };
  // will be called every time a logging statement is made
  plugin.on('log', function(msg){
    console.log("called")
    if (!_.contains(msg.tags, 'add-metric')) return;
    (msg.data && msg.data.data && msg.data.name) ?  reportStandardFormMessage(msg) : undefined;
  });
}
