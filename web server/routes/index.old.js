
/*
 * GET home page.
 */

exports.index = function(req, res){
	var pg = require('pg'); 
	pg.connect(process.env.DATABASE_URL || 'postgres://localhost:5432/floorplanviz', function(err, client, done) {
		client.query('SELECT * FROM stores', function(err, result) {
		    done();
		    if(err) return console.error(err);
		    res.render('index', { title: 'Stores', stores: result.rows});
		  });
	});
};