exports.getData = function(req, res){
  var pg = require('pg');
  var conString = process.env.DATABASE_URL || 'postgres://localhost:5432/cattrack';

  var client = new pg.Client(conString);
  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    var query = 'select * from rssiData order by time desc limit 10;'
    console.log(query);
    client.query(query, function(err, result) {
      if(err) {
        return console.error('error running query', err);
      }
      // console.log(result);
      client.end();
      // res.writeHead(200);
      res.send(result.rows);
    });
  });
}