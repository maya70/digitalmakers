// this is the D3.js V3 zoomable circle packing example retrieved from http://bl.ocks.org/renecnielsen/9904735/8e5bff8801cb5c8dee88c722d4deb5e4078ff8ce

function drawCircles(svgID, counter, name)
{
var margin = 10,
    outerDiameter = 560,
    innerDiameter = outerDiameter - margin - margin;

var x = d3.scale.linear()
    .range([0, innerDiameter]);

var y = d3.scale.linear()
    .range([0, innerDiameter]);

var color = d3.scale.linear()
    .domain([-1, 5])
    .range(["#e1f4fd", "#00aeef"])
    .interpolate(d3.interpolateHcl);

var pack = d3.layout.pack()
    .padding(2)
    .size([innerDiameter, innerDiameter])
    .value(function(d) { return d.size; })

var svg = d3.select(svgID).append("svg")
    .attr("id", "svg-" + counter)
    .attr("width", outerDiameter)
    .attr("height", outerDiameter)
  .append("g")
    .attr("transform", "translate(" + margin + "," + margin + ")");

d3.json("data/"+name+".json", function(error, root) {
  var focus = root,
      nodes = pack.nodes(root);

  svg.append("g").selectAll("circle")
      .data(nodes)
    .enter().append("circle")
      .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .attr("r", function(d) { return d.r; })
      .style("fill", function(d) { return d.children ? color(d.depth) : "white"; })
      .on("click", function(d) { 
          killForce(svg);
           if(!d.children){
              createForce(svg,400,400, d);
              }

        return zoom(focus == d ? root : d); });

  svg.append("g").selectAll("text")
      .data(nodes)
    .enter().append("text")
      .attr("class", "label")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
      .style("display", function(d) { return d.parent === root ? null : "none"; })
      .style("font-size", "14px")
      .text(function(d) { return d.name; });

  d3.select(window)
      .on("click", function() { 
        killForce(svg);
        zoom(root); });

  function zoom(d, i) {
    var focus0 = focus;
    focus = d;


    var k = innerDiameter / d.r / 2;
    x.domain([d.x - d.r, d.x + d.r]);
    y.domain([d.y - d.r, d.y + d.r]);
    d3.event.stopPropagation();

    var transition = d3.selectAll("text,circle").transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .attr("transform", function(d) { 
            
            var itemclass = d3.select(this).attr("class"); 
           // console.log(itemclass);
          return (itemclass==="sankey-text")? null :"translate(" + (x(d.x)) + "," + y(d.y) + ")"; });

    transition.filter("circle")
        .attr("r", function(d) { return k * d.r; });

    transition.filter("text")
      .filter(function(d) { return d.parent === focus || d.parent === focus0; })
        .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
        .each("start", function(d) { 
          if (d.parent === focus) this.style.display = "inline";

           })
        .each("end", function(d) { 
          if (d.parent !== focus) this.style.display = "none";
           });

       
  }
});

d3.select(self.frameElement).style("height", outerDiameter + "px");
}