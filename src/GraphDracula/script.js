/* GraphDracula

Graph Visualization Extension Object for QlikView based on Dracula Graph Library (JavaScript): http://www.graphdracula.net/

Created by Ralf Becher - ralf.becher@tiq-solutions.de - TIQ Solutions, Leipzig, Germany

Tested on QV 11.0, 11.2

TIQ Solutions takes no responsbility for any code.
Use at your own risk. */

var template_path = Qva.Remote + "?public=only&name=Extensions/GraphDracula/";
function extension_Init()
{
	// Use QlikView's method of loading other files needed by an extension. These files should be added to your extension .zip file (.qar)
  Qva.LoadScript(template_path + 'raphael.js', function() {
    Qva.LoadScript(template_path + 'dracula_graffle.js', function() {
      Qva.LoadScript(template_path + 'dracula_graph.js', extension_Done);
    });
  });
}

function extension_Done(){
	//Add extension
	Qva.AddExtension('GraphDracula', 
	function(){
		//Load a CSS style sheet if needed
		//Qva.LoadCSS(template_path + "style.css");
		
	var _this = this;
	var iFrameWidth = _this.GetWidth();
	var iFrameHeight = _this.GetHeight();

	var divName = _this.Layout.ObjectId.replace("\\", "_");

	if (_this.Element.children.length == 0) {
		var ui = document.createElement("div");
		ui.setAttribute("id", divName);
		_this.Element.appendChild(ui);
		$("#" + divName).css("height", iFrameHeight + "px").css("width", iFrameWidth + "px");
	} else {
		$("#" + divName).css("height", iFrameHeight + "px").css("width", iFrameWidth + "px");
		$("#" + divName).empty();
	};

  var g = new Graph();

	for (var i=0,k=_this.Data.Rows.length;i<k;i++){
		var row = _this.Data.Rows[i];
		
		if(row[0].text) { // Node1 ID
			if(row[1].text && row[2].text) { // Node1 Type && Label
				if(row[8].text!='-') { // Node1 Color
					g.addNode(row[0].text, { label : row[2].text + '\n[' + row[1].text + ']', stroke : row[8].text , fill : row[8].text });
				} else {
					g.addNode(row[0].text, { label : row[2].text + '\n[' + row[1].text + ']' });
				}
			} else {
				g.addNode(row[0].text);
			}
	  }
		if(row[3].text) { // Node2 ID
			if(row[4].text && row[5].text) { // Node2 Type && Label
				if(row[9].text!='-') { // Node2 Color
					g.addNode(row[3].text, { label : row[5].text + '\n[' + row[4].text + ']', stroke : row[9].text , fill : row[9].text });
				} else {
					g.addNode(row[3].text, { label : row[5].text + '\n[' + row[4].text + ']' });
				}
			} else {
				g.addNode(row[3].text);
			}
	  }
		if(row[0].text && row[3].text) { // Node1 & Node2 ID
			if(row[6].text) { // Relation Label
				if(row[10].text!='-') { // Relation Color
//					g.addEdge(row[0].text, row[3].text, {directed: true, label: row[6].text, stroke : row[10].text, fill : row[10].text, "stroke-width": row[9].text, "label-style" : { "font-size" : 10 }});
					g.addEdge(row[0].text, row[3].text, {directed : true, label : row[6].text, stroke : row[10].text, "label-style" : { "font-size" : 10 }});
				} else {
//					g.addEdge(row[0].text, row[3].text, {directed: true, label: row[6].text, "stroke-width": row[9].text, "label-style" : { "font-size" : 10 }});
					g.addEdge(row[0].text, row[3].text, {directed : true, label : row[6].text, "label-style" : { "font-size" : 10 }});
				}				
			} else {
				g.addEdge(row[0].text, row[3].text, {directed: true});
			}
		}
  };

  /* layout the graph using the Spring layout implementation */
  var layouter = new Graph.Layout.Spring(g);

  /* draw the graph using the RaphaelJS draw implementation */
  var renderer = new Graph.Renderer.Raphael(divName, g, iFrameWidth, iFrameHeight);

  redraw = function() {
    layouter.layout();
    renderer.draw();
  };
  
  redraw();
		
//	}, false);
	});
}
//Initiate extension
extension_Init();
