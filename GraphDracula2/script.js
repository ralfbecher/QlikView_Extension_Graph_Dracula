/* GraphDracula

Graph Visualization Extension Object for QlikView based on Dracula Graph Library (JavaScript): http://www.graphdracula.net/

Created by Ralf Becher - ralf.becher@tiq-solutions.de - TIQ Solutions, Leipzig, Germany

Tested on QV 11.0, 11.2

TIQ Solutions takes no responsbility for any code.
Use at your own risk. */

(function () {
    var path = "Extensions/GraphDracula2/";
    Qv.LoadExtensionScripts([path + 'raphael.js', path + 'dracula_graffle.js', path + 'dracula_graph.js'], function () {
        Qv.AddExtension('GraphDracula2',
            function () {
                var _this = this;
                var iFrameWidth = _this.GetWidth();
                var iFrameHeight = _this.GetHeight();
                var tooltip = null, tooltip_bg = null;
				var countEdges = _this.Data.Rows.length;
				var smallLayout = countEdges > 100;
                
                var div = $('<div />').appendTo($(_this.Element).empty()).attr({ id: _this.Layout.ObjectId.replace("\\", "_") });
               
                //$(_this.Element).empty().append(div.height(iFrameHeight).width(iFrameWidth));
                Graph.Renderer.defaultRenderFunc = function (raphael, node) {
                    var color = Raphael.getColor();
                    var size = parseInt(node.size);
                    size = size ? size : 30;
					if (smallLayout) {
						size = size / 2;
					}

                    var ellipse = raphael.ellipse(0, 0, size, size * 2 / 3).attr({
                        fill: node.fill || color,
                        stroke: node.stroke || color,
                        //title: node.tooltip,
                        "stroke-width": smallLayout ? 1 : 2
                    }).data("node", node);

                    /**
                        support for multiline tooltip - can't rely on native title 
                    */
                    if (node.tooltip || false) {
                        if (!(tooltip_bg || false)) {
                            tooltip_bg = raphael.rect(0, 0, 100, 17, 5).attr({ fill: '#eeeeee', stroke: '#999999' }).hide();
                            tooltip_bg.node.setAttribute('class', 'tooltip_bg');
                        }
                        if (!(tooltip || false)) {
                            tooltip = raphael.text(0, 0, "").attr({ 'text-anchor': 'start' }).hide();
                            tooltip.node.setAttribute('class', 'tooltip');
                        }
                        var offset = div.offset();
                        ellipse.mousemove(
                            function (evt) {
                                tooltip.attr({ x: evt.clientX + 5 - offset.left, text: node.tooltip });
                                tooltip.show();
                                var box = tooltip.node.getBBox();
                                var y = evt.clientY - box.height / 2 - 8 - offset.top;
                                tooltip.attr({ y: y });
                                box = tooltip.node.getBBox();
                                tooltip_bg.attr({ x: box.x - 5, y: box.y - 5, width: box.width + 10, height: box.height + 10 });
                                tooltip_bg.show().toFront();
                                tooltip.toFront();

                            }).mouseout(
                            function (evt) {
                                tooltip.hide();
                                tooltip_bg.hide();
                            });

                    }
                    var set = raphael.set().push(ellipse).data("node", node).click(function (e) {
                        if (e.ctrlKey)
                            return false;

                        var node = this.data("node");
                        if (e.altKey) {
                            Qv.GetCurrentDocument().Clear();
                            //_this.Data.ClearSelections();
		                        _this.Data.SelectTextsInColumn(node.column, false, node.id);
                            //return;
                        } else {
							var selection = [[], []];
							for (i = 0; i < node.edges.length; i++) {
								selection[0].push(node.edges[i].source.id);
								selection[1].push(node.edges[i].target.id);
							}
							_this.Data.SelectTextsInColumn(0, false, selection[0]);
							_this.Data.SelectTextsInColumn(1, false, selection[1]);
							//setTimeout(function () { _this.Data.SelectTextsInColumn(0, false, selection[0]) }, 0);
							//setTimeout(function () { _this.Data.SelectTextsInColumn(1, false, selection[1]); }, 0);     
	                      }
                    });
					if (!smallLayout) {
						if ((node.label || false))
							set.push(raphael.text(0, node.size * 1.5, node.label || node.id).attr(node["label-style"]));
					}
					return set;
                };
                var g = new Graph();

                var parentLabel = _this.Data.HeaderRows[0][2].text || false,
                    childLabel = _this.Data.HeaderRows[0][3].text || false,
                    relLabel = _this.Data.HeaderRows[0][4].text || false,
                    parentSize = _this.Data.HeaderRows[0][5].text || false,
                    childSize = _this.Data.HeaderRows[0][6].text || false,
                    parentColor = _this.Data.HeaderRows[0][7].text || false,
                    childColor = _this.Data.HeaderRows[0][8].text || false,
                    edgeColor = _this.Data.HeaderRows[0][9].text || false,
                    parentTooltip = _this.Data.HeaderRows[0][10].text || false,
                    childTooltip = _this.Data.HeaderRows[0][11].text || false
                ;

                for (var i = 0, k = _this.Data.Rows.length; i < k; i++) {
                    var row = _this.Data.Rows[i];
                    if (row[1].value || false) {
                        g.addNode(row[1].text, {
                            label: childLabel ? row[3].text.replace("\\n", "\n") : null,
                            size: childSize ? row[6].data : 30,
                            tooltip: childTooltip ? row[11].text.replace("\\n", "\r\n") : null,
                            stroke: (childColor) ? row[8].text : 'rgb(100,100,100)',
                            fill: (childColor) ? row[8].text : 'rgb(100,100,100)',
                            "label-style": { "font-size": 9, "fill": (childColor) ? row[8].text : 'rgb(100,100,100)' },
                            column: 1
                        });
                    }

                    if (row[0].value || false) {
                        g.addNode(row[0].text, {
                            label: parentLabel ? row[2].text.replace("\\n", "\n") : null,
                            size: parentSize ? row[5].data : 30,
                            tooltip: parentTooltip ? row[10].text.replace("\\n", "\r\n") : null,
                            stroke: (parentColor) ? row[7].text : 'rgb(100,100,100)',
                            fill: (parentColor) ? row[7].text : 'rgb(100,100,100)',
                            "label-style": { "font-size": 9, "fill": (parentColor) ? row[7].text : 'rgb(100,100,100)' },
                            column: 0
                        });
                    }

                    if ((row[0].value || false) && (row[1].value || false)) {
                        g.addEdge(row[0].text, row[1].text, {
                            directed: true,
                            label: smallLayout ? '' : relLabel ? row[4].text.replace("\\n", "\n") : '',
                            stroke: edgeColor ? row[9].text : '#aaaaaa',
                            "label-style": { "font-size": 9, "fill": edgeColor ? row[9].text : '#aaaaaa' }
                        });
                       
                    }
                };

                var layouter = new Graph.Layout.Spring(g);
                //layouter.layout();
                var renderer = new Graph.Renderer.Raphael(div.attr('id'), g, iFrameWidth, iFrameHeight);
                redraw = function () {
                    layouter.layout();
                    renderer.draw();
                };
                //setTimeout(redraw, 0);
                redraw();
            }
        )
    });

})();
