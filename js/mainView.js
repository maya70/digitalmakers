(function($V){
	'use strict'
	$V.MainView = $V.defineClass(
					null, 
					function MainView(control){
						var self = this;
						self.control = control;
						self.iter = 0; 
						self.setupControls(); 
						//self.setupDrag(document.getElementById("mainCard"));
						 
						self.cardSetupDrag();
					},
					{
						cardSetupDrag: function(){
							var self= this; 
							var sx, sy, dx, dy; 
							var container = d3.select(".draggabledivcontainer")
										.call(d3.behavior.drag()
											.on('start.interrupt', function(){
												sx = d3.event.x;
												sy = d3.event.y; 
												container.interrupt();	
											})
											.on('start drag', function(){
												//var curx = parseInt(container.style('left')); 
												//var cury = parseInt(container.style('top'));
												dx = d3.event.x - sx;
												dy = d3.event.y - sy; 
												if(dx > 10 || dy > 10)
												{
													container.style('top', (this.parentNode.getBoundingClientRect().top+ dy) + 'px')
													container.style('left', (this.parentNode.getBoundingClientRect().left + dx) + 'px')
												}
											}));



							var div = d3.select(".draggablediv");

							div.call(d3.drag()
								.on('drag', function(){
											 var x = d3.mouse(this.parentNode)[0];
											 var y = d3.mouse(this.parentNode)[1];
											 var pWidth = this.parentNode.getBoundingClientRect().width; 
											 var pHeight = this.parentNode.getBoundingClientRect().height; 
											 if (x > (pWidth - 20) && y > (pHeight - 20) )
											 {
												console.log(y);
												x = Math.max(50, x);
												y = Math.max(50, y);
												div.style('width', x + 'px'); 	
												div.style('height', y + 'px'); 
												container.style('width', x+'px');	
												div.dispatch("resize");
											 }
											
										}));
								
							
						},
						 setupClassMenus: function(classNames){
                            var self = this;                 
                            self.classNames = classNames;        
                            var undef; 
                            self.exportedData = undef; 
                            var start_btn = document.getElementById("selection-butt");
                            $.each(self.classNames, function(){
                                 $("<option />")
                                    .attr("value", this.value )
                                    .html(this.name)
                                    .appendTo("#sel-1");
                                });
                            $.each(self.classNames, function(){
                                 $("<option />")
                                    .attr("value", this.value )
                                    .html(this.name)
                                    .appendTo("#sel-2");
                                });
                            var cl1 = document.getElementById("sel-1");
                            var cl2 = document.getElementById("sel-2");
                            self.c1 = cl1.value; 
                            self.c2 = cl2.value;
                            
                            cl1.addEventListener("change", function(){
                                self.c1 = this.value;
                                if(self.svg){ 
                                    self.svg.selectAll("*").remove();
                                    //self.svg.remove();
                                    }
                                if(self.svgLegend)
                                    {
                                        self.svgLegend.selectAll("*").remove();
                                        //d3.select(".legend").remove();
                                    }
                                self.exportedData = undef; 
                                if(self.c1 !== self.c2){
                                	start_btn.disabled = false;
                                }
                                else
                                	start_btn.disabled = true; 
                                //self.drawHierarchy((self.width-100), (self.height-100), self.root);   
                                //self.drawModelROC();
                            });
                            
                            cl2.addEventListener("change", function(){
                                self.c2 = this.value;
                                if(self.svg){ 
                                    self.svg.selectAll("*").remove();
                                    //self.svg.remove();
                                    }
                                if(self.svgLegend)
                                    {
                                        self.svgLegend.selectAll("*").remove();
                                        //d3.select(".legend").remove();
                                    }
                                self.exportedData = undef; 
                                if(self.c1 !== self.c2){
                                	start_btn.disabled = false;
                                }
                                else
                                	start_btn.disabled = true; 
                                //self.drawHierarchy((self.width-100), (self.height-100), self.root);   
                                //self.drawModelROC();
                            });
                            console.log(classNames);

                        },
                      
						createQualCard: function(){
							var self = this;
							var card1 = d3.select("#mainCanvas").append("div")
								.attr("class", "draggablediv")
								.attr("id", "display1")
								.style("margin-top", "20px");
								//.style("top", "110px")
								//.style("left", "580px");


							card1.append("div")
								.attr("class", "draggabledivheader");

						},
						drawDendogramCollapse: function(data){
							var self = this;
							var width = 600, 
								height = 400; 
							var margin = ({top: 10, right: 120, bottom: 10, left: 60});
							var dx = 30, 
								dy = width/4; 
							
							var tree = d3.tree().nodeSize([dx, dy]);
							var diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x); 

							const root = d3.hierarchy(data);

							root.x0 = dy / 2;
							root.y0 = 0;
							root.descendants().forEach((d, i) => {
							    d.id = i;
							    d._children = d.children;
							    if (d.depth && d.data.name.length !== 7) d.children = null;
							});

						  const svg = d3.select("#draw-area-1").append("svg")  //
						      .attr("width", width)
						      .attr("height", dx)
						      //.attr("height", height)
						      .attr("viewBox", [-margin.left, -margin.top, width, dx])
						      //.attr("viewBox", [margin.left, margin.top, width/2, height/2])
						      .style("font", "10px sans-serif")
						      .style("user-select", "none");
						      //.classed("svg-content-responsive", true);

						  const gLink = svg.append("g")
						      .attr("fill", "none")
						      .attr("stroke", "#555")
						      .attr("stroke-opacity", 0.4)
						      .attr("stroke-width", 1.5);

						  const gNode = svg.append("g")
						      .attr("cursor", "pointer");

						  function update(source) {
						    const duration = d3.event && d3.event.altKey ? 2500 : 250;
						    const nodes = root.descendants().reverse();
						    const links = root.links();

						    // Compute the new tree layout.
						    tree(root);

						    let left = root;
						    let right = root;
						    root.eachBefore(node => {
						      if (node.x < left.x) left = node;
						      if (node.x > right.x) right = node;
						    });

						    const height = right.x - left.x + margin.top + margin.bottom;

						    const transition = svg.transition()
						        .duration(duration)
						        .attr("height", height)
						        .attr("viewBox", [-margin.left, left.x - margin.top, width*1.6, height])
						        .tween("resize", window.ResizeObserver ? null : () => () => svg.dispatch("toggle"));

						    // Update the nodes…
						    const node = gNode.selectAll("g")
						      .data(nodes, d => d.id);

						    // Enter any new nodes at the parent's previous position.
						    const nodeEnter = node.enter().append("g")
						        .attr("transform", d => `translate(${source.y0},${source.x0})`)
						        .attr("fill-opacity", 0)
						        .attr("stroke-opacity", 0)
						        .on("click", d => {
						          d.children = d.children ? null : d._children;
						          update(d);
						        });

						    nodeEnter.append("circle")
						        .attr("r", 6.5)
						        .attr("fill", d => d._children ? "#555" : "#999")
						        .on("click", function(){
						        	console.log("node clicked");
						        	var wdiv = $(".draggablediv").width(); 
						        	//$(".draggabledivcontainer").width(wdiv+70); 
						        	//$("svg").width(wdiv+65);
						        });

						    nodeEnter.append("text")
						        .attr("dy", "0.31em")
						        .attr("x", d => d._children ? -6 : 6)
						        .attr("text-anchor", d => d._children ? "end" : "start")
						        .text(d => d.data.name)
						      .clone(true).lower()
						        .attr("stroke-linejoin", "round")
						        .attr("stroke-width", 3)
						        .attr("stroke", "white");

						    // Transition nodes to their new position.
						    const nodeUpdate = node.merge(nodeEnter).transition(transition)
						        .attr("transform", d => `translate(${d.y},${d.x})`)
						        .attr("fill-opacity", 1)
						        .attr("stroke-opacity", 1);

						    // Transition exiting nodes to the parent's new position.
						    const nodeExit = node.exit().transition(transition).remove()
						        .attr("transform", d => `translate(${source.y},${source.x})`)
						        .attr("fill-opacity", 0)
						        .attr("stroke-opacity", 0);

						    // Update the links…
						    const link = gLink.selectAll("path")
						      .data(links, d => d.target.id);

						    // Enter any new links at the parent's previous position.
						    const linkEnter = link.enter().append("path")
						        .attr("d", d => {
						          const o = {x: source.x0, y: source.y0};
						          return diagonal({source: o, target: o});
						        });

						    // Transition links to their new position.
						    link.merge(linkEnter).transition(transition)
						        .attr("d", diagonal);

						    // Transition exiting nodes to the parent's new position.
						    link.exit().transition(transition).remove()
						        .attr("d", d => {
						          const o = {x: source.x, y: source.y};
						          return diagonal({source: o, target: o});
						        });

						    // Stash the old positions for transition.
						    root.eachBefore(d => {
						      d.x0 = d.x;
						      d.y0 = d.y;
						    });
						  }

						  update(root);
						  /*updateRecursive(root);

						  function updateRecursive(node){
						  	root.children.forEach(function(d){
						  		d.children = d.children ? null : d._children;
						    	update(d);
								if(d._children)
								   return updateRecursive(d); 
								else 
									return 1; 
						  	});	

						  }*/

						  
						  //$(".draggablediv").width(1000); 
  						return svg.node();
								
						},
						drawHierarchy: function (root) {
								var self = this;
								var width = 500, 
									height = 500; 

								if(!self.svg)
								{
									self.svg = d3.select("#draw-area-1").append("svg")
														.attr("width", width)
														.attr("height", height)
														.append("g")
														.attr("transform", "translate("+ (width/2)+","+ (height/2) +")");
								}
								
								self.levels = [ {name:'Genus', value: '#f7f7f7',  r: 6.5*(width/14)},
												{name:'Family', value:'#d9d9d9',  r: 5*(width/14)},
												{name:'Order', value: '#bdbdbd',  r: 4*(width/14)},
												{name:'Class', value:'#969696',  r: 3*(width/14) },
												{name:'Phylum', value: '#636363', r: 2*(width/14)}];
								
								var div = d3.select("body").append("div")
												.attr("class", "tooltip")
												.style("opacity", 0);

								self.arcspecs = [];
								for(var a=0; a< self.levels.length; a++){
									var newarc = d3.arc()
													.innerRadius((self.levels[a].r-(width/12)))
													.outerRadius(self.levels[a].r)
													.startAngle(0)
													.endAngle(Math.PI*2);
									self.arcspecs.push(newarc);
									var arc = self.svg.append("path")
												.attr("class", "arc")
												.attr("d", newarc)
												.style("fill", function(d){return self.levels[a].value; })
												.style("opacity", .3);
									  arc.datum(self.levels[a]);

									  arc.on('mouseover', function(d){
											var c = d3.select(this);
											c.style("opacity", 1.0);
											div.transition()		
								                .duration(200)		
								                .style("opacity", .9);		
								            div	.html("<strong> Level: </strong> <br/>" +d.name)	
								                .style("left", (d3.event.pageX) + "px")		
								                .style("top", (d3.event.pageY - 28) + "px");								
										})
										.on('mouseout', function(d){
											var c = d3.select(this);
											if(d.name !== self.selectedLevel){
												c.style("opacity", 0.3);
												}
											div.transition()		
								                .duration(500)		
								                .style("opacity", 0);	

										})
										.on('click', function(d){
											self.selectedLevel = d.name;
											d3.selectAll(".arc").style("opacity", 0.3);
											d3.select(this).style("opacity", 1.0);
										});
								}
													
								self.drawRadialCluster((width-100), (height-100), root);
												//self.selectNodes();
								//self.drawCluster(width, height, root);					
							},
							drawRadialCluster: function(width, height, root){
								var self = this;
								var cluster = d3.layout.cluster()
													.size([width, height])
													.separation(function(a,b) { return (a.parent === b.parent? 3:4)/a.depth; });
								var c = document.getElementById("sel-1");
								self.cls1 = c.options[c.selectedIndex].value;
								c = document.getElementById("sel-2");
								self.cls2 = c.options[c.selectedIndex].value;
								
								var elem = document.getElementById("selection-butt");
								if(self.cls1 !== self.cls2)
								{
									elem.disabled = false;
									elem.value = "New Selection";
						            elem.style.backgroundColor ="lightgrey";
						             
								}
								else{
									elem.disabled = true;
									elem.style.backgroundColor ="grey";
									elem.value = "start";
								}
								var nodes = cluster.nodes(root);
								var links = cluster.links(nodes);
								self.getImportanceRange();
								var link = self.svg.selectAll(".link")
												.data(links)
												.enter().append("path")
												.attr("class", ".link")
												.attr("d", function(d){
													//console.log(d);
													/*return "M" + [d.target.x, (d.target.depth*50)]
															+ "C" + [d.target.x, (d.target.depth*50+d.source.depth*50)/2]
															+ " " + [d.source.x, (d.target.depth*50 + d.source.depth*50)/2]
															+ " " + [d.source.x, d.source.depth*50];*/
													return "M" + project(d.target.x, (d.target.depth ===0? d.target.depth: (d.target.depth+0.7))*(width/6))
															+ "C" + project(d.target.x, ((d.target.depth===0? d.target.depth: d.target.depth+0.7)*(width/6)+(d.source.depth===0? d.source.depth: d.source.depth+0.7)*(width/6))/2)
															+ " " + project(d.source.x, ((d.target.depth===0? d.target.depth: d.target.depth+0.7)*(width/6) + (d.source.depth===0? d.source.depth: d.source.depth+0.7)*(width/6))/2)
															+ " " + project(d.source.x, (d.source.depth===0? d.source.depth: d.source.depth+0.7)*(width/6));
												})
												//.attr("transform", "translate(-200,-200)")
												.style("fill", "none")
												.style("stroke", "black");

								var div = d3.select("body").append("div")
												.attr("class", "tooltip2")
												.style("opacity", 0);


								self.nodes = self.svg.selectAll(".node")
											.data(nodes)
											.enter().append("g")
											.attr("class", function(d) {
															return "node" + (d.children? " internal": " leaf");
											})
											.attr("transform", function(d){ return "translate("+project(d.x , ((d.depth===0? d.depth: (d.depth+0.7)) * (width/6)))+")";})
											.on('mouseover', function(d){
												div.transition()		
									                .duration(200)		
									                .style("opacity", .9);		
								            	div	.html("<strong> Entity: </strong> <br/>" +d.name)	
									                .style("left", (d3.event.pageX) -50 + "px")		
									                .style("top", (d3.event.pageY + 28) + "px");	
											})
											.on('mouseout', function(d){
												div.transition()		
								                .duration(500)		
								                .style("opacity", 0);	
											});
								
								var scaleFactor = 1.8;

								self.leaves= self.svg.selectAll(".leaf");

								self.leaves.append("line")
									.attr("x1", function(d){
										if(d.name.includes("g__"))
											{
												return (d.y*0.01 * Math.cos((d.x-90)/180*Math.PI));
											}
										else
											return 0;
									})
									.attr("y1", function(d){
										if(d.name.includes("g__"))
											{
												return (d.y*0.01*Math.sin((d.x-90)/180*Math.PI));
											}
										else
											return 0;
									})
									.attr("x2", function(d){
										if(d.name.includes("g__"))
											{
												return (d.y*0.04 * Math.cos((d.x-90)/180*Math.PI));
											}
										else
											return 0;
									})
									.attr("y2", function(d){
										//console.log(d);
										if(d.name.includes("g__"))
											{
												return (d.y*0.04*Math.sin((d.x-90)/180*Math.PI));}
										else
											return 0;
									})
									.style("stroke-width", 5)
									.style("stroke", function(d){
										if (self.cls1 !== self.cls2){
											return "black";
										}	
										else{
											return "black";
										}
									})
									.style("opacity", function(d){
										var selcls = self.cls1+self.cls2;
										var show = (selcls === "RF" || selcls === "FR");


										if(d.name.includes("g__")&& (show || (self.cls1 === self.cls2)))
											{
												var index = self.importance.findIndex(x => x.name==d.name);
												var scale = self.importance[index]['MDA_RF'];
												//scale = (scale - self.ranges['minA_RF']) / (self.ranges['maxA_RF'] - self.ranges['minA_RF']);
												scale = (scale - self.ranges['minA_total']) / (self.ranges['maxA_total'] - self.ranges['minA_total']);
												//var logimp = d3.scale.log()
												//		.domain([1.0, 10.0])
												//		.range([0.0, 1.0]);	
												return scale*scaleFactor;}
										else
											return 0;
									})
									.on('click', function(d){
											var index = self.importance.findIndex(x => x.name==d.name);
											var imp = self.importance[index]['MDA_RF'];
											console.log(imp);
											div.transition()		
								                .duration(200)		
								                .style("opacity", .9);		
							            	div	.html("<strong> MDA = </strong> <br/>" + imp)	
								                .style("left", (d3.event.pageX) -50 + "px")		
								                .style("top", (d3.event.pageY + 28) + "px");	
								            d3.event.stopPropagation();				
										
									});


									self.svg.selectAll(".leaf")
									.append("line")
									.attr("x1", function(d){
										if(d.name.includes("g__"))
											return (d.y*0.04 * Math.cos((d.x-90)/180*Math.PI));
										else
											return 0;
											})
									.attr("y1", function(d){
										//console.log(d);
										if(d.name.includes("g__"))
											{
												return (d.y*0.04*Math.sin((d.x-90)/180*Math.PI));}
										else
											return 0;
										})
									.attr("x2", function(d){
										if(d.name.includes("g__"))
											{
												return (d.y*0.07 * Math.cos((d.x-90)/180*Math.PI));
											}
										else
											return 0;
									})
									.attr("y2", function(d){
										//console.log(d);
										if(d.name.includes("g__"))
											{
												return (d.y*0.07*Math.sin((d.x-90)/180*Math.PI));}
										else
											return 0;
									})
									.style("stroke-width", 5)
									.style("stroke", "black")
									.style("opacity", function(d){
										var selcls = self.cls1+self.cls2;
										var show = (selcls === "RE" || selcls === "ER");


										if(d.name.includes("g__")&& (show || (self.cls1 === self.cls2)))
										
											{
												var index = self.importance.findIndex(x => x.name==d.name);
												var scale = self.importance[index]['MDA_RE'];
												//scale = (scale - self.ranges['minA_RE']) / (self.ranges['maxA_RE'] - self.ranges['minA_RE']);
												scale = (scale - self.ranges['minA_total']) / (self.ranges['maxA_total'] - self.ranges['minA_total']);
												return scale*scaleFactor;
											}
										else
											return 0;
									})
									.on('click', function(d){
										var index = self.importance.findIndex(x => x.name==d.name);
										var imp = self.importance[index]['MDA_RE'];
										console.log(imp);
										div.transition()		
							                .duration(200)		
							                .style("opacity", .9);		
						            	div	.html("<strong> MDA = </strong> <br/>" + imp)	
							                .style("left", (d3.event.pageX) -50 + "px")		
							                .style("top", (d3.event.pageY + 28) + "px");					
										d3.event.stopPropagation();	
									});

									self.svg.selectAll(".leaf")
									.append("line")
									.attr("x1", function(d){
										if(d.name.includes("g__"))
											{
												return (d.y*0.07 * Math.cos((d.x-90)/180*Math.PI));
											}
												else
													return 0;
											})
											.attr("y1", function(d){
												//console.log(d);
												if(d.name.includes("g__"))
													{
														return (d.y*0.07*Math.sin((d.x-90)/180*Math.PI));}
												else
													return 0;
											})
											.attr("x2", function(d){
												if(d.name.includes("g__"))
													{
														return (d.y*0.1 * Math.cos((d.x-90)/180*Math.PI));
													}
												else
													return 0;
											})
									.attr("y2", function(d){
										//console.log(d);
										if(d.name.includes("g__"))
											{
												return (d.y*0.1*Math.sin((d.x-90)/180*Math.PI));}
										else
											return 0;
									})
									.style("stroke-width", 5)
									.style("stroke", "black")
									.style("opacity", function(d){
										var selcls = self.cls1+self.cls2;
										var show = (selcls === "EF" || selcls === "FE");


										if(d.name.includes("g__")&& (show || (self.cls1 === self.cls2)))
										
											{
												var index = self.importance.findIndex(x => x.name==d.name);
												var scale = self.importance[index]['MDA_EF'];
												//scale = (scale - self.ranges['minA_EF']) / (self.ranges['maxA_EF'] - self.ranges['minA_EF']);
												scale = (scale - self.ranges['minA_total']) / (self.ranges['maxA_total'] - self.ranges['minA_total']);
												return scale* scaleFactor;}
										else
											return 0;
									})
									.on('click', function(d){
										var index = self.importance.findIndex(x => x.name==d.name);
										var imp = self.importance[index]['MDA_EF'];
										console.log(imp);
										div.transition()		
							                .duration(200)		
							                .style("opacity", .9);		
						            	div	.html("<strong> MDA = </strong> <br/>" + imp)	
							                .style("left", (d3.event.pageX) -50 + "px")		
							                .style("top", (d3.event.pageY + 28) + "px");					
										d3.event.stopPropagation();	
									});

									//self.nodes.call(self.drag);
								self.nodeCircles = self.nodes.append("circle")
									.attr("r", 2.5)
									.attr("class", "nodeCircle")
									.on("click", function(d){
										if(self.selectionON){
											self.addSelectedNode(d, this);
										}
									});


									
							function project(x, y){
									var angle = (x - 90)/180 * Math.PI, radius = (y * 0.5);
									return [radius*Math.cos(angle), radius*Math.sin(angle)];
									}
							}, 
						setupControls: function(){
							var self = this;
							d3.select("#cat-button").on("click", function(o){
								var pan = this.nextElementSibling; 
								if(pan){
									if(pan.style.display === "none"){
				                            	pan.style.display = "block";
				                        		}
				                       		 else
				                            	pan.style.display = "none"; 
								}
							});
							/*var buttons = d3.selectAll(".control-button"); 
							buttons.each(function(but){
								but.class("acco")
								//console.log(but); 
							}); */
							 jQuery("[data-toggle=popover]").popover({
						        html : true,
						        container: '#home',
						        content: function() {
						          var content = $(this).attr("data-popover-content");
						          return $(content).children(".popover-body").html();
						        },
						        title: function() {
						          var title = $(this).attr("data-popover-content");
						          return $(title).children(".popover-heading").html();
						        }
						    });


						}
						

						
					}
		);
})(VISUALRF);