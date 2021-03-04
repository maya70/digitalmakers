(function($V){
	'use strict'
	$V.Control = $V.defineClass(
					null, 
					function Control(config){
						var self = this;
						self.mainView = new $V.MainView(self); 
						self.dataModel = new $V.Model(self); 
						self.addHierarchy(); 
						
					},
					{
						viewReady: function(view){
							var self = this; 
							self.dataModel.readData(); 
						}, 
						addHierarchy: function(){
							var self = this; 
							self.dataModel.loadImportance(); 
						},
						drawHierarchy: function(root){
							var self = this; 
							self.mainView.drawDendogramCollapse(root);
						},
						startClassifier: function(params){
							var self = this; 
							if(!params){
								// This is a fresh start:
								// 1. Build the attribute hierarchy
								// 2. run the classifier on entire dataset 
								self.dataModel.readFeatureHierarchy();



							}
						}
						
					}
		);
})(VISUALRF);