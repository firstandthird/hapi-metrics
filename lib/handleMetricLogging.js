
module.exports = function(plugin){
  var reportStandardFormMessage = function(msg){
    plugin.plugins.metrics.add(msg.data.name, msg.data.data, function(err,result){
      if (err) plugin.log(['hapi-metrics', 'error'], {msg: err});
      else plugin.log(['hapi-metrics', 'info'], {msg: "Metric " + msg.data.name + " added"});
    });
  };
  // will be called every time a logging statement is made
  plugin.on('log', function(msg){
    if (!msg.tags.indexOf('add-metric')) return;
    (msg.data && msg.data.data && msg.data.name) ?  reportStandardFormMessage(msg) : undefined;
  });
}
