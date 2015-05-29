module.exports = function(server, endpoint, auth, collection) {

  server.route({
    method: 'GET',
    path: endpoint+'/aggregate',
    config: {
      auth: auth
    },
    handler: function(request, reply) {

      var type = request.query.type;

      var days = request.query.days || 31;
      var dateOffset = (24*60*60*1000) * days;
      var startDate = new Date();
      startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      startDate.setTime(startDate.getTime() - dateOffset);

      var query = {
        type: type,
        date: { $gt: startDate }
      };

      var filters = (typeof request.query.filter === 'string') ? [request.query.filter] : request.query.filter;
      if (filters) {
        filters.forEach(function(filter) {
          var f = filter.split(':');
          query['data.'+f[0]] = f[1];
        });
      }

      var distinct = (request.query.distinct) ? '$'+request.query.distinct : '';

      collection.aggregate([
        { $match: query },
        { $group: {
            _id : { month: { $month: '$date' }, day: { $dayOfMonth: '$date' }, year: { $year: '$date' }, distinct: distinct },
            count: { $sum: 1 }
          }
        },
      ], function(err, results) {
        if (err) {
          return reply(err);
        }

        var out = results.map(function(result) {
          var o = {
            date: new Date(result._id.year, result._id.month-1, result._id.day),
            value: result.count
          };
          if (result._id.distinct) {
            o.distinct = result._id.distinct;
            o.value = 1;
          }
          return o;
        });

        reply(out);
      });

    }
  });

};
