var Hapi = require('hapi');
var port = process.env.PORT || 8081;
var server = new Hapi.Server({
  debug: {
    log: ['hapi-metrics', 'error'],
    request: ['tail', 'error']
  }
});
server.connection({ port: port });

server.register([
  {
    register: require('../'),
    options: {
      connectionUrl: 'mongodb://localhost:27017/metric-test'
    }
  }
], function(err) {
  if (err) {
    throw err;
  }


  server.start(function() {
    console.log('Hapi server started @', server.info.uri);
    server.log(['metrics', 'add-metric'], {
      name:"Bob",
      data: {
          type : "twitter-follows",
          value : 51
      },
      callback: function(err,result){
        console.log(err);
        console.log(result);
      }
    });
  });
});
