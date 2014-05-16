var data;
var locations;

$(document).ready(function() {
	data = readHeatmapData();
	locations = readLocations();

	var catmap = d3.catmap()
			.locations(locations)
			.counts(data);
});