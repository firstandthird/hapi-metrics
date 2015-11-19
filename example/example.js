var Hapi = require('hapi');
var port = process.env.PORT || 8081;
var server = new Hapi.Server({
  debug: {
    log: ['hapi-metrics', 'error'],
    request: ['tail', 'error']
  }
});
server.connection({ port: port });
var metricsReportTag = 'append-metric';
server.register([
  {
    register: require('../'),
    options: {
      handleMetricLogs : true,
      metricsReportTag : metricsReportTag,
      connectionUrl: 'mongodb://localhost:27017/metric-test'
    }
  }
], function(err) {
  if (err) {
    throw err;
  }

server.start(function() {
    console.log('Hapi server started @', server.info.uri);
    server.log([metricsReportTag], {name:"twitter-follows", data:"23"});
  });
});
