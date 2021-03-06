 var margin = {
        top: 10,
        right: 1,
        bottom: 6,
        left: 10
      },
      width = 900 - margin.left - margin.right,
      height = 460 - margin.top - margin.bottom;

var clickcounter = 1; 
    var formatNumber = d3.format(",.0f"),
      format = function(d) {
        return formatNumber(d) + " TWh";
      },
      color = d3.scale.category20c();

    var svg = d3.select("#draw-area-1").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var sankey = d3.sankey()
      .nodeWidth(15)
      .nodePadding(10)
      .size([width, height]);

    var path = sankey.link();

    d3.json("data/energy.json", function(energy) {

      sankey
        .nodes(energy.nodes)
        .links(energy.links)
        .layout(32);



      function setDash(d) {
        var d3this = d3.select(this);
        var totalLength = d3this.node().getTotalLength();
        d3this
          .attr('stroke-dasharray', totalLength + ' ' + totalLength)
          .attr('stroke-dashoffset', totalLength)
      }

      function branchAnimate(nodeData) {
        var links = svg.selectAll(".gradient-link")
          .filter(function(gradientD) {
            return nodeData.sourceLinks.indexOf(gradientD) > -1
          });
        var nextLayerNodeData = [];
        links.each(function(d) {
          nextLayerNodeData.push(d.target);
        });

        links
          .style("opacity", null)
          .transition()
          .duration(400)
          .ease('linear')
          .attr('stroke-dashoffset', 0)
          .each("end", function() {
            nextLayerNodeData.forEach(function(d) {
              branchAnimate(d);
            });
          });
      } //end branchAnimate

      var gradientLink = svg.append("g").selectAll(".gradient-link")
        .data(energy.links)
        .enter().append("path")
        .attr("class", "gradient-link")
        .attr("d", path)
        .style("stroke-width", function(d) {
          return Math.max(1, d.dy);
        })
        .sort(function(a, b) {
          return b.dy - a.dy;
        })
        .each(setDash)
        .style('stroke', function(d) {
          var sourceColor = color(d.source.name.replace(/ .*/, "")).replace("#", "");
          var targetColor = color(d.target.name.replace(/ .*/, "")).replace("#", "");
          var id = 'c-' + sourceColor + '-to-' + targetColor;
          if (!svg.select(id)[0][0]) {
            //append the gradient def
            //append a gradient
            var gradient = svg.append('defs')
              .append('linearGradient')
              .attr('id', id)
              .attr('x1', '0%')
              .attr('y1', '0%')
              .attr('x2', '100%')
              .attr('y2', '0%')
              .attr('spreadMethod', 'pad');

            gradient.append('stop')
              .attr('offset', '0%')
              .attr('stop-color', "#" + sourceColor)
              .attr('stop-opacity', 1);

            gradient.append('stop')
              .attr('offset', '100%')
              .attr('stop-color', "#" + targetColor)
              .attr('stop-opacity', 1);
          }
          return "url(#" + id + ")";
        });

      var link = svg.append("g").selectAll(".link")
        .data(energy.links)
        .enter().append("path")
        .attr("class", "link")
        .attr("d", path)
        .style("stroke-width", function(d) {
          return Math.max(1, d.dy);
        })
        .sort(function(a, b) {
          return b.dy - a.dy;
        });

      //link.append("title")
       // .text(function(d) {
       //   return d.source.name + " → " + d.target.name + "\n" + format(d.value);
       // });


      var node = svg.append("g").selectAll(".node")
        .data(energy.nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";
        })
        .on("click", function(d){
          clickcounter++;
          createDashboard(this, clickcounter, d);
        })
        .on("mouseover", branchAnimate)
        .on("mouseout", function() {
          //cancel all transitions by making a new one
          gradientLink.transition();
          gradientLink
            .style("opacity", 0)
            .each(function(d) {
              setDash.call(this, d);
            });
        });


      node.append("rect")
        .attr("height", function(d) {
          return d.dy;
        })
        .attr("width", sankey.nodeWidth())
        .style("fill", function(d) {
          return d.color = color(d.name.replace(/ .*/, ""));
        });
       // .append("title")
       // .text(function(d) {
        //  return d.name + "\n" + format(d.value);
        //});

      node.append("text")
        .attr("class", "sankey-text")
        .attr("x", -6)
        .attr("y", function(d) {
          return d.dy / 2;
        })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function(d) {
          return d.name;
        })
        .filter(function(d) {
          return d.x < width -100;
        })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");

    });