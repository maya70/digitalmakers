(function($V){
    'use strict'
    $V.Model = $V.defineClass(
                    null, 
                    function Model(control){
                        var self = this;
                        self.control = control; 
                        self.classNames = [{name: "Russia", value: "R"}, 
                                           {name:"Finland", value: "F"},
                                           {name:"Estonia", value: "E"}];              
                
                        //self.varFile = './data/variables.csv';
                        self.mainView = control.mainView;
                        //self.featureHierarchy = 
                        self.mainView.setupClassMenus(self.classNames);
                        // self.dataFile = self.readData(); // TODO: Move this inside the file read of the feature hierarchy
                        //self.featureHierarchy = new $V.FeatureHierarchy();
                    },
                    {

                       readFeatureHierarchy: function(){
                        var self = this; 
                         var varFile = './data/variables.csv';   
                         d3.csv(varFile, function(vars){
                           console.log(vars);
                           self.buildHierarchy(vars);
                         });                   
                       },
                       loadImportance: function(){
                        var self = this;
                        //self.subset_importance = true;
                        if(self.subset_importance){
                          d3.json('./data/subset61_imp.json', function(imp){
                            self.subimp = imp;
                            for(var i=0; i < self.subimp.length; i++){
                              var temp = self.subimp[i]['name'].split('|');
                              self.subimp[i]['name'] = temp[temp.length -1];
                            }
                          });
                        }
                        d3.json('./data/vatanen_imp.json', function(imp){
                          self.importance = imp;
                          /*
                          for(var i=0; i< self.importance.length; i++){
                            var temp = self.importance[i]['name'].split('|');
                            self.importance[i]['name'] =  temp[temp.length-1];
                          }*/
                          console.log(self.importance);
                          self.selectionButton = d3.select("#selection-butt");
                          self.selectionButton.on("click", function(){
                            if(!self.selectionON ){
                              self.selectionON = true;
                              self.selectedNodes = [];
                              self.updateNodes(); 
                            }
                            else {
                                var div = d3.select("body").append("div")
                                .attr("class", "tooltip3")
                                .style("opacity", 0);

                              div.transition()    
                                        .duration(0.01)   
                                        .style("opacity", .9);    
                                    div .html("<strong> Running RandomForest </strong> <br/> <p> This may take up to a few minutes </p> <br/> <p> Please do not navigate to another tab. </p> ")  
                                        .style("left", "0px")   
                                        .style("top",  "0px")
                                        .style("width", document.body.clientWidth + "px")
                                        .style("height", document.body.clientHeight + "px");

                                    div.append("div")
                                      .attr("id", "loader");                

                              self.selectionON = false;
                        
                              // send selected nodes to RF
                              //self.callRF(div);
                              //self.selectedNodes = [];
                              
                            }
                          });
                          //self.buildHierarchy(self.importance.map(function(d){
                          //  return d['name']; 
                          //}));
                          self.readData(); 
                        });

                       },
                       getFeatureFullName: function(node){
                          var name = node.name;
                          while(node.parent){
                            name = node.parent.name + "|"+name; 
                            node = node.parent;
                          }
                          //name = name.replace('[','').replace(']','');
                          return name; 
                        },
        
            
                        findParent: function(i, root, parent, current, ancestry){
                            var self=this;
                            var pfname = self.getFeatureFullName(root);
                            var lineage = ''+ ancestry[0];
                            for(var a = 1; a < ancestry.length; a++){
                              lineage += '|' + ancestry[a]; 
                            }
                            if(root.name === parent && pfname === lineage){
                              if(root.children.indexOf(current)>=0) // gene already exists as a child
                                return;
                              root.children.push({id: i, name: current, children:[], parent: root});
                              return;
                            }
                            else 
                              for(var child=0; child< root.children.length; child++){
                                if(root.children.length>0) self.findParent(i, root.children[child], parent, current, ancestry);
                              }
                        },
                      
            
                    buildHierarchy: function(features){
                            var self=this;
                            var tree=[];
                            tree[0]={};
                            tree[0].id= 0; 
                            tree[0].name='k__Bacteria';
                            tree[0].children = [];
                            
                            for(var i=0; i < features.length; i++){
                              var genes = features[i].split("|");
                              var g = genes.length - 1;
                              //var pnode = self.findParent(i, tree[0], genes[g-1], genes[g]);
                              var pnode = self.findParent(i, tree[0], genes[g-1], genes[g], genes.slice(0,g));                              
                              //if(pnode) pnode.children.push({id: i, name: genes[g], children:[] });
                            }
                            //console.log(tree[0]);
                            self.root = tree[0];
                            console.log(features);
                            console.log(self.root);
                            self.control.drawHierarchy(self.root);

                          },
                          
                    readData: function(){
                        var self = this;
                        var dataFile = './data/vatanen.csv';

                        self.cls1 = self.control.mainView.c1;
                        self.cls2 = self.control.mainView.c2; 
                        var response = "country";
                        var training = [], test = [];
                        var features = [];
              
                        console.log(self.cls1);
                        console.log(self.cls2);

                        /*if((self.cls1 === "R" && self.cls2 === "F")||(self.cls1==="F"&&self.cls2==="R"))
                          dataFile = "./data/vatanen_dfrf.json";
                        else if((self.cls1 === "R" && self.cls2 === "E")||(self.cls1==="E"&&self.cls2==="R"))
                          dataFile = "./data/vatanen_dfre.json";
                        else if((self.cls1 === "F" && self.cls2 === "E")||(self.cls1==="E"&&self.cls2==="F"))
                          dataFile = "./data/vatanen_dfef.json";
                        */
                        d3.csv(dataFile, function(data){
                          for(var i = 0; i < data.length; i++)
                            {
                              var d = {};
                                d[response] = parseInt(data[i][response]);
                                d['sampleID'] = i;
                             for(var key in data[i]) {
                                if(key !== response)
                                  d[key] = data[i][key];
                              }
                              training.push(d);
                            }
                            console.log(training);
                            var variables = Object.keys(training[0]);
                            var features = [];
                            for(var v =0; v < variables.length; v++){
                              if(variables[v] !== 'sampleID' && variables[v] !== response)
                                features.push(variables[v]);
                            }

                            self.buildHierarchy(features);

               
                        });

                       }
                    }
                    );
})(VISUALRF);


