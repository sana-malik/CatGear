var data;
var locations;

function parseData(data) {
	var dataObjs = [];
	$.each(data, function(index, obj) {
		var tmp = {};
		tmp["time"] = moment(obj["time"], "YYYY-MM-DDTHH:mm:ssZ");
		tmp["oranges"] = obj["oranges"];
		tmp["greyest"] = obj["greyest"];
		dataObjs.push(tmp);
	});

	return dataObjs;
}

$(document).ready(function() {
	data = parseData(readData());
	locations = readLocations();

	var cattracks = d3.cattracks()
			.points(data)
			.paths(locations)
			.runAnimation();

	$("#speed_up").on("click", function() {
		cattracks.speed_up();
	})

	$("#slow_down").on("click", function() {
		cattracks.slow_down();
	})
});