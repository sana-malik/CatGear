d3.catmap = function() {
  var catmap = {},
      counts = [],
      locations = {},
      width = 1400,
      height = 894,
      timeHeight = 100,
      svg = d3.select("#main").append("svg").attr("width", width).attr("height", height+timeHeight+30),
      index = 0,
      timescale = d3.time.scale(),
      duration = 500,
      cat = "#666";

  catmap.counts = function(_) {
    if (!arguments.length) return counts;
    counts = _;

    var maxVal = 0;
    $.each(counts, function(loc, count) {
      if (count > maxVal) maxVal = count;
    });

    $.each(counts, function(loc, count) {
      d3.select(".loc#" + loc)
        .attr("fill", cat)
        .attr("fill-opacity", count/maxVal);
    });

    // add labels and counts
    $.each(locations, function(loc, obj) {
        var coords = obj["location"].split(",");
        d3.select("svg").append("text")
            .attr("x", coords[0])
            .attr("y", coords[1])
            .text(function() {
              if (loc in counts) return loc + " (" + counts[loc] + ")";
              else return loc + " (0)";
            });
    })

    return catmap;
  };

  catmap.locations = function(_) {
    if (!arguments.length) return locations;
    locations = _;

    // append locations
    $.each(locations, function(start, obj) {
      var coords = obj["location"].split(",");

      d3.select("svg").append("circle")
        .attr("id", start)
        .attr("class","loc")
        .attr("r","75px")
        .attr("transform", "translate(" + coords.join(",") + ")");
    });
    return catmap;
  };

  catmap.runAnimation = function(_) {
    // remove old
    d3.selectAll(".cat").remove();
    d3.select("#timeMarker").remove();

    // place time marker
    var timeMarker = svg.append("rect")
      .attr("id", "timeMarker")
      .attr("width", "5px")
      .attr("height", timeHeight)
      .attr("transform", "translate(" + timescale(counts[index]["time"]) + "," + height + ")");

    $("#timestamp").text(counts[index]["time"].format("MMMM Do YYYY, h:mm a"));

    // place cat markers
    var oranges = svg.append("g")
      .attr("id", "oranges")
      .attr("class", "cat")
      .attr("transform", "translate(" + locations[counts[index]["oranges"]]["location"] + ")");

    oranges.append("svg:image")
      .attr('width', 30)
      .attr('height', 30)
      .attr("xlink:href","images/orange-paw.png");

    var greyest = svg.append("g")
      .attr("id", "greyest")
      .attr("class", "cat")
      .attr("transform", "translate(" + locations[counts[index]["greyest"]]["location"] + ")");


    greyest.append("svg:image")
      .attr('width', 30)
      .attr('height', 30)
      .attr('x', -31)
      .attr('y', -31)
      .attr("xlink:href","images/grey-paw.png");
  
    transition();
  
    function transition() {
      index++;
      if (index >= counts.length) return;

      // update time marker
      timeMarker.transition()
        .duration(duration)
        .attr("transform",  "translate(" + timescale(counts[index]["time"]) + "," + height + ")");
      $("#timestamp").text(counts[index]["time"].format("MMMM Do YYYY, h:mm a"));
      
      // update cat markers
      var pathId = "#" + counts[index-1]["oranges"] + "-" + counts[index]["oranges"];
      oranges.transition()
        .duration(duration)
        .attrTween("transform", translateAlong(d3.select(pathId).node()))   

      pathId = "#" + counts[index-1]["greyest"] + "-" + counts[index]["greyest"];
      greyest.transition()
        .duration(duration)
        .attrTween("transform", translateAlong(d3.select(pathId).node()))
        .each("end", transition); // do next transition until last timestamp
    }
    
    function translateAlong(path) {
      var l = path.getTotalLength();
      return function(i) {
        return function(t) {
          var p = path.getPointAtLength(t * l);
          return "translate(" + p.x + "," + p.y + ")"; // Move marker
        }
      }
    }

    return catmap;
  };

  catmap.speed_up = function() {
    duration /= 1.5;
  };

  catmap.slow_down = function() {
    duration *= 1.5;
  };

  return catmap;
};
