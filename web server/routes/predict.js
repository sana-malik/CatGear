exports.predict = function(req, res){
  var pg = require('pg');
  var conString = process.env.DATABASE_URL || 'postgres://localhost:5432/cattrack';
  var client = new pg.Client(conString);
  var gear_id_oranges = 'GALAXY Gear (7BDB)', gear_id_greyest = 'GALAXY Gear (9F2B)';
  var trainData_oranges = [], trainData_greyest = [], testData = [];
  var predictions = [];

  client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    // #
    var query = 'select * from trainData1 where gear_id = \'' + gear_id_oranges + '\'';
    client.query(query, function(err, result) {
      if(err) {
        return console.error('error running query', err);
      }
      trainData_oranges = result.rows;
    });
    // #
    query = 'select * from trainData1 where gear_id = \'' + gear_id_greyest + '\'';
    client.query(query, function(err, result) {
      if(err) {
        return console.error('error running query', err);
      }
      trainData_greyest = result.rows;
    });
    // #
    var testPoint_oranges = {
      "rssi_c24":0, 
      "rssi_617":0, 
      "rssi_230":0,
    };
    var testPoint_greyest = {
      "rssi_c24":0, 
      "rssi_617":0, 
      "rssi_230":0,
    };
    query = 'select gear_id, rssi_c24, rssi_617, rssi_230, time from (select *, count(*) over (partition by time) as numTime from rssidataformatted) t where numTime = 2 order by time';
    client.query(query, function(err, result) {
      if(err) {
        return console.error('error running query', err);
      }
      testData = result.rows;
      var time = '';
      for(var i in testData) {
        if(time !== testData[i].time.toISOString()) {
          time = testData[i].time.toISOString();
          if(testData[i].gear_id === gear_id_oranges) {
            testPoint_oranges.rssi_c24 = testData[i].rssi_c24;
            testPoint_oranges.rssi_617 = testData[i].rssi_617;
            testPoint_oranges.rssi_230 = testData[i].rssi_230;
          } else if(testData[i].gear_id === gear_id_greyest) {
            testPoint_greyest.rssi_c24 = testData[i].rssi_c24;
            testPoint_greyest.rssi_617 = testData[i].rssi_617;
            testPoint_greyest.rssi_230 = testData[i].rssi_230;
          }
        } else {
          if(testData[i].gear_id === gear_id_oranges) {
            testPoint_oranges.rssi_c24 = testData[i].rssi_c24;
            testPoint_oranges.rssi_617 = testData[i].rssi_617;
            testPoint_oranges.rssi_230 = testData[i].rssi_230;
          } else if(testData[i].gear_id === gear_id_greyest) {
            testPoint_greyest.rssi_c24 = testData[i].rssi_c24;
            testPoint_greyest.rssi_617 = testData[i].rssi_617;
            testPoint_greyest.rssi_230 = testData[i].rssi_230;
          }
          predictions.push({
            "time":time,
            "oranges":getLocation(testPoint_oranges, trainData_oranges),
            "greyest":getLocation(testPoint_greyest, trainData_greyest)
          });
        }
      }
      res.send(predictions);
      client.end();
    });
  });
}

var knn = require('alike');
var knn_options = {
    k: 3,
    weights: {
      "rssi_c24":0.33, 
      "rssi_617":0.33, 
      "rssi_230":0.33,
      // "gear_id":0.25
    }
  };
  
function getLocation(testPoint, trainData) {
  var knn_locations = knn(testPoint, trainData, knn_options);
  var locations = {};
  for(var i in knn_locations) {
    count = locations[knn_locations[i].location];
    if(count === undefined) {
      locations[knn_locations[i].location] = 1;
    } else {
      locations[knn_locations[i].location] = count + 1;
    }
  }
  var maxCount = 0;
  var maxLocation = '';
  for(var l in locations) {
    if(locations[l] > maxCount) {
      maxCount = locations[l];
      maxLocation = l;
    }
  }
  if(maxCount > 1)
    return maxLocation;
  else
    return knn_locations[0].location;
}
