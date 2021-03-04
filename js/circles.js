 var svg = d3.select("svg"),
        margin = 20,
        diameter = 650,
        g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

    var color = d3.scaleLinear()
        .domain([-1, 5])
        .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
        .interpolate(d3.interpolateHcl);

    var pack = d3.pack()
        .size([diameter - margin, diameter - margin])
        .padding(2);

    d3.json("flare.json", function(error, root) {
      if (error) throw error;

      root = d3.hierarchy(root)
          .sum(function(d) { return d.size; })
          .sort(function(a, b) { return b.value - a.value; });

      var focus = root,
          nodes = pack(root).descendants(),
          view;

      var circle = g.selectAll("circle")
        .data(nodes)
        .enter().append("circle")
          .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
          .style("fill", function(d) { return d.children ? color(d.depth) : "white"; })
          .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); 
                  //console.log(d);
                            });

      var text = g.selectAll("text")
        .data(nodes)
        .enter().append("text")
          .attr("class", "label")
          .style("fill-opacity", function(d) { return d.parent === root ? 1 : 1; })
          .style("display", function(d) {
                 return d.parent === root ? "inline" : "none"; })
          .style("font-size", "16pt")
          .text(function(d) { return d.data.name; });

      

      var node = g.selectAll("circle,text");

      svg
          .style("background", "lightgrey")
          .on("click", function() { zoom(root); });

      zoomTo([root.x, root.y, root.r * 2 + margin]);

      function zoom(d) {
        var focus0 = focus; focus = d;
        console.log("zoom called");
        var transition = d3.transition()
            .duration(d3.event.altKey ? 7500 : 750)
            .tween("zoom", function(d) {
              var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
              return function(t) { zoomTo(i(t)); };
            });

        transition.selectAll("text")
          //.filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
            .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 1; })
            .on("start", function(d) { if (d.parent === focus) {
                                  this.style.display = "inline";
                                }
                })
            .on("end", function(d) { 
              console.log(d);
              if (d.parent !== focus){
                 this.style.display = "none";
              } 
             if(!d.children && (d === focus || d.parent === focus))
               { this.style.display = "inline";}
             if(!d.children && d === focus ) // TODO add more restrictions here 
             {
               createDashboard(this);
             }
                 });
      }

      function zoomTo(v) {
        var k = diameter / v[2]; view = v;
        node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
        circle.attr("r", function(d) { return d.r * k; });
      }

      function createDashboard(selected){
        console.log(selected);
        var container = d3.select("#mainCardContainer");
        var card = container.append("div")
                .attr("class", "draggablediv")
                .attr("id", "draw-area-2")
                .style("position", "absolute")
                .style("margin-left", "100%")
                .style("margin-top", "-12%")
                .style("min-width","850px")
                .style("width","150%")
                .style("min-height", "550px")
                .style("height", "100%")
                .style("background-color","#ccc")
                .style("border", "1px solid #d3d3d3")
                .style("opacity", 1.0);

       
        csvg = d3.select("#draw-area-2")                                                              
                        .append("svg")
                            .style("display", "inline-block")
                            .attr("id", "mainsvg-2")
                            .attr("class", "mainsvg")
                            .attr("x", 0)
                            .attr("y", 0)
                            .attr("width", "1000px" )
                            .attr("height", "300px" );

              var rect1 = csvg.append('rect')
                              .attr("x",10)
                              .attr("y",10)
                              .attr("width", 1000)
                              .attr("height",300)
                              .style("fill","white");
           createForce(csvg, 1000, 300);

      }

      function createForce(rect, width, height){

      
    var color = d3.scaleOrdinal(d3.schemeCategory20),
    valueline = d3.line()
      .x(function(d) { return d[0]; })
      .y(function(d) { return d[1]; })
      .curve(d3.curveCatmullRomClosed),
    paths,
    groups,
    groupIds,
    scaleFactor = 1.2,
    polygon,
    centroid,
    node,
    link,
    curveTypes = ['curveBasisClosed', 'curveCardinalClosed', 'curveCatmullRomClosed', 'curveLinearClosed'],
    simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id(function(d) { return d.id; }))
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2));


d3.json('miserables.json', function(error, graph) {
  if (error) throw error;

  // create selector for curve types
  var select = d3.select('#curveSettings')
    .append('select')
    .attr('class','select')
    .on('change', function() {
      var val = d3.select('select').property('value');
      d3.select('#curveLabel').text(val);
      valueline.curve(d3[val]);
      updateGroups();
    });
  var options = select
    .selectAll('option')
    .data(curveTypes).enter()
    .append('option')
      .text(function (d) { return d; });


  // create groups, links and nodes
  groups = rect.append('g').attr('class', 'groups');

  link = rect.append('g')
      .attr('class', 'links')
    .selectAll('line')
    .data(graph.links)
    .enter().append('line')
      .attr('stroke-width', function(d) { return Math.sqrt(d.value); });

  node = rect.append('g')
      .attr('class', 'nodes')
    .selectAll('circle')
    .data(graph.nodes)
    .enter().append('circle')
      .attr('r', 5)
      .attr('fill', function(d) { return color(d.group); })
      .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended));

  // count members of each group. Groups with less
  // than 3 member will not be considered (creating
  // a convex hull need 3 points at least)
  groupIds = d3.set(graph.nodes.map(function(n) { return +n.group; }))
    .values()
    .map( function(groupId) {
      return { 
        groupId : groupId,
        count : graph.nodes.filter(function(n) { return +n.group == groupId; }).length
      };
    })
    .filter( function(group) { return group.count > 2;})
    .map( function(group) { return group.groupId; });

  paths = groups.selectAll('.path_placeholder')
    .data(groupIds, function(d) { return +d; })
    .enter()
    .append('g')
    .attr('class', 'path_placeholder')
    .append('path')
    .attr('stroke', function(d) { return color(d); })
    .attr('fill', function(d) { return color(d); })
    .attr('opacity', 0);

  paths
    .transition()
    .duration(2000)
    .attr('opacity', 1);

  // add interaction to the groups
  groups.selectAll('.path_placeholder')
    .call(d3.drag()
      .on('start', group_dragstarted)
      .on('drag', group_dragged)
      .on('end', group_dragended)
      );

  node.append('title')
      .text(function(d) { return d.id; });

  simulation
      .nodes(graph.nodes)
      .on('tick', ticked)
      .force('link')
      .links(graph.links);

  function ticked() {
    link
        .attr('x1', function(d) { return d.source.x; })
        .attr('y1', function(d) { return d.source.y; })
        .attr('x2', function(d) { return d.target.x; })
        .attr('y2', function(d) { return d.target.y; });
    node
        .attr('cx', function(d) { return d.x; })
        .attr('cy', function(d) { return d.y; });
    
    updateGroups();
  }

});



// select nodes of the group, retrieve its positions
// and return the convex hull of the specified points
// (3 points as minimum, otherwise returns null)
var polygonGenerator = function(groupId) {
  var node_coords = node
    .filter(function(d) { return d.group == groupId; })
    .data()
    .map(function(d) { return [d.x, d.y]; });
    
  return d3.polygonHull(node_coords);
};



function updateGroups() {
  groupIds.forEach(function(groupId) {
    var path = paths.filter(function(d) { return d == groupId;})
      .attr('transform', 'scale(1) translate(0,0)')
      .attr('d', function(d) {
        polygon = polygonGenerator(d);          
        centroid = d3.polygonCentroid(polygon);

        // to scale the shape properly around its points:
        // move the 'g' element to the centroid point, translate
        // all the path around the center of the 'g' and then
        // we can scale the 'g' element properly
        return valueline(
          polygon.map(function(point) {
            return [  point[0] - centroid[0], point[1] - centroid[1] ];
          })
        );
      });

    d3.select(path.node().parentNode).attr('transform', 'translate('  + centroid[0] + ',' + (centroid[1]) + ') scale(' + scaleFactor + ')');
  });
}


// drag nodes
function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

// drag groups
function group_dragstarted(groupId) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d3.select(this).select('path').style('stroke-width', 3);
}

function group_dragged(groupId) {
  node
    .filter(function(d) { return d.group == groupId; })
    .each(function(d) {
      d.x += d3.event.dx;
      d.y += d3.event.dy;
    })
}

function group_dragended(groupId) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d3.select(this).select('path').style('stroke-width', 1);
}

      }
    });

  