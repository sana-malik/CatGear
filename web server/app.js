
/**
 * Module dependencies.
 */

var express = require('express'), 
cors = require('cors');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
// app.use(cors);
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

var writeDataRoute = require('./routes/writeData');
app.get('/writeData', cors(),  writeDataRoute.writeData);
app.post('/writeData', cors(), writeDataRoute.writeData);
var getDataRoute = require('./routes/getData');
app.get('/getData', cors(), getDataRoute.getData);

var writeTrainDataRoute = require('./routes/writeTrainData');
app.get('/writeTrainData', cors(),  writeTrainDataRoute.writeTrainData);
app.post('/writeTrainData', cors(), writeTrainDataRoute.writeTrainData);
var getTrainDataRoute = require('./routes/getTrainData');
app.get('/getTrainData', cors(), getTrainDataRoute.getTrainData);

var predictRoute = require('./routes/predict');
app.get('/predict', predictRoute.predict);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
