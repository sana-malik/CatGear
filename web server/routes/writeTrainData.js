exports.writeTrainData = function(req, res){
  var device_id = req.body.device_id || req.query.device_id;
  var gear_id = req.body.gear_id || req.query.gear_id;
  var rssi = req.body.rssi || req.query.rssi;
  var location = req.body.location || req.query.location;

  var pg = require('pg');
  var conString = process.env.DATABASE_URL || 'postgres://localhost:5432/cattrack';

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    var query = 'insert into trainData (device_id, gear_id, rssi, location, time) values (\''+device_id+'\', \''+gear_id+'\', '+rssi+ ', \'' +location+ '\', NOW());';
    console.log(query);
    client.query(query, function(err, result) {
      if(err) {
        return console.error('error running query', err);
      }
      // console.log(result);
      client.end();
      res.writeHead(200);
      res.end(query);
    });
  });
};