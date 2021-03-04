 function createDashboard(selected, counter, datum){
        console.log(datum);
        console.log(d3.select(selected).select("rect").attr("y"));
        var selcolor = d3.select(selected).select("rect").style("fill");
        var container = d3.select("#mainCanvas");
        var yoffset = counter*20;
        var card = container.append("div")
                .attr("class", "draggablediv")
                .attr("id", "draw-area-"+counter)
                .style("position", "absolute")
                .style("margin-left", "650px")
                .style("margin-top", yoffset+"px")
                .style("min-width","500px")
                .style("width","600px")
                .style("min-height", "500px")
                .style("height", "600px")
                .style("background-color",selcolor)
                .style("border", "1px solid #d3d3d3")
                .style("border-radius", 5)
                .style("z-index", 100)
                .style("opacity", 1.0);

       
        /*csvg = d3.select("#draw-area-"+counter)                                                              
                        .append("svg")
                            .style("display", "inline-block")
                            .attr("id", "mainsvg-"+counter)
                            .attr("class", "mainsvg")
                            .attr("x", 0)
                            .attr("y", 0)
                            .attr("width", "570px" )
                            .attr("height", "450px" );

              var rect1 = csvg.append('rect')
                              .attr("x",10)
                              .attr("y",10)
                              .attr("width", 570)
                              .attr("height",450)
                              .style("fill","white");*/


              drawCircles("#draw-area-"+counter, counter, datum.name);
           
      }

     