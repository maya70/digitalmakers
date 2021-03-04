 function killForce(svg){
    svg.selectAll(".fnode").remove();
    svg.selectAll(".flink").remove();
 }

 function createForce(svg, width, height, datum){
 console.log(datum);
      
  var width = 450,
    height = 400;


var force = d3.layout.force()
    .gravity(0.05)
    .distance(200)
    .charge(-300)
    .size([width, height]);

d3.json("data/"+datum.name+".json", function(error, json) {
  if (error) throw error;

  force
      .nodes(json.nodes)
      .links(json.links)
      .start();

  
  var flink = svg.selectAll(".flink")
      .data(json.links)
    .enter().append("line")
      .attr("class", "flink")
      .style("fill", "black")
      .style("stroke", function(d){
        if(d.source.group === d.target.group )
          return "black";
        else
          return "lightgrey";
      })
      .style("stroke-width", 2);

  var fnode = svg.selectAll(".fnode")
      .data(json.nodes)
    .enter().append("g")
      .attr("class", "fnode")
      .call(force.drag);

  fnode.append("image")
      .attr("xflink:href", function(d){ return d.img; })
      .attr("x", -8)
      .attr("y", -8)
      .attr("width", 46)
      .attr("height", 46);

  fnode.append("text")
      .attr("dx", 40)
      .attr("dy", ".35em")
      .text(function(d) { return d.name });

  force
  .on("tick", function() {
    flink.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    fnode.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  });
});

      }