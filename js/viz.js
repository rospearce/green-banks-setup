let networkWidth;
let netwrkHeight;

function updateSize () {
    
    networkWidth = $("#network").width();
    networkHeight = $("#network").height();
    let windowWidth = $(window).width();



    if (windowWidth < 501) {
        networkHeight = 300;
    }

    $("#background").width(networkWidth);
    $("#background").height(networkHeight);

    $("#flow-wrapper").width(networkWidth*5);

    let flowHeight = $("#flow-wrapper").height();
    $("#flow-wrapper").css("margin-top", function () {
        return (networkHeight - flowHeight)/2;
    });

    $("#dot-nav").css("left", function () {
        return (networkWidth/2 - 30);
    });

    if (networkHeight > networkWidth) {

        $("#viz-wrapper").height(networkWidth);

        $("#viz-wrapper").css("margin-left", 0);
        $("#viz-wrapper").css("margin-top", function () {
            return (networkHeight - networkWidth)/2;
        });

    } else {

        $("#viz-wrapper").height(networkHeight);
        $("#viz-wrapper").width(networkHeight);

        $("#viz-wrapper").css("margin-top", 0);
        $("#viz-wrapper").css("margin-left", function () {
            return (networkWidth - networkHeight)/2;
        });

    }

}

updateSize();

$(window).on('resize', function () {
    updateSize();
});

const width = 600;
    height = 600;
    colors = ["rgb(94,101,142)", "rgb(56,138,142)", "rgb(78,183,125)", "rgb(91,170,72)", "rgb(188,184,57)"];
    svg = d3.select("#viz-wrapper").append("svg")
    .attr("id", "viz")
    .attr("viewBox", "0 0 600 600")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("g");

var simulation = d3.forceSimulation()
    .force("link", 
        d3.forceLink().distance(140).id(function(d) { return d.id; })
    )
    .force('charge', d3.forceManyBody()
        .strength(-2400)
        .theta(0.8)
    )
    .force("center", d3.forceCenter(width / 2, height / 2));

let node;
let link;
let circles;
let label1;
let label2;
let stepper = 1;
let varState = 0;

function makeChart () {

    d3.json("./data/data1.json", function(error, graph) {
        if (error) throw error;
    
        link = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(graph.links)
            .enter().append("line")
            .attr("stroke-width", function(d) { return d.value; })
            .attr("stroke", function(d) {
                return d3.rgb(colors[(stepper - 1)]).darker(0.5);
            });
    
        node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(graph.nodes)
            .enter().append("g");
            
        circles = node.append("circle")
            .attr("r", function(d) {
                if (d.id !== "5") {
                    return 45; 
                } else {
                    return 60;
                }
            })
            .style("fill", function(d) {
                if (d.id !== "5") {
                    return colors[(stepper - 1)]; 
                } else {
                    return "white";
                }
            })
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .on("click", mouseclick);
    
        // hacky way of getting two lines without bothering with html
        label1 = node.append("text")
            .text(function(d) {
                return d.label1;
            })
            .style("fill", function(d) {
                if (d.id !== "5") {
                    return "white"; 
                } else {
                    return colors[(stepper - 1)]; 
                }
            })
            .style("font-size", function(d) {
                if (d.id !== "5") {
                    return "15px"; 
                } else {
                    return "19px";
                }
            })
            .style("font-weight", function(d) {
                if (d.id !== "5") {
                    return "normal"; 
                } else {
                    return "bold";
                }
            })
            .attr("class", "label")
            .attr('x', 0)
            .attr('y', -5);
    
        label2 = node.append("text")
            .text(function(d) {
                return d.label2;
            })
            .style("fill", function(d) {
                if (d.id !== "5") {
                    return "white"; 
                } else {
                    return colors[(stepper - 1)]; 
                }
            })
            .attr("dy", function(d) {
                if (d.id !== "5") {
                    return "1px"; 
                } else {
                    return "4px";
                }
            })
            .style("font-size", function(d) {
                if (d.id !== "5") {
                    return "15px"; 
                } else {
                    return "19px";
                }
            })
            .style("font-weight", function(d) {
                if (d.id !== "5") {
                    return "normal"; 
                } else {
                    return "bold";
                }
            })
            .attr("class", "label")
            .attr('x', 0)
            .attr('y', 15);
    
        
        function ticked() {
    
            link
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });
    
            node
                .attr("transform", function(d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });

        }
    
        simulation.nodes(graph.nodes)
            .on("tick", ticked);
    
        simulation.force("link")
            .links(graph.links);
    
    });
}

makeChart();

function mouseover(d) {
    switch(varState) {
        case 0:
            if (d.id !== "5") {
                d3.select(this).style("fill", function(){return d3.rgb(colors[(stepper - 1)]).darker(1);});
                d3.select(this).style("cursor", "pointer");
            };
            break;
        case 1:
                d3.select(this).style("cursor", "default");
            break;
    }

}

function mouseout(d) {
    if (d.id !== "5") {
        d3.select(this).style("fill", function(){return colors[(stepper - 1)]});
    }
}

function mouseclick(d) {
    switch(varState) {
        case 0:
            if (d.id !== "5") {
                d3.select("#questions").html(d.text);
                d3.selectAll("h3, .point-up").style("color", function(d) {
                    return colors[(stepper -1)];
                });
            };
            break;
        case 1:
            // no actions
            break;
    }

}

function restart() {

    d3.json("./data/data" + stepper + ".json", function(error, graph) {
        if (error) throw error;

        // UPDATE UI

        d3.select("#stage").style("background-color", function(d) {
            return colors[(stepper -1)];
        });

        if (varState == 0) {

            d3.select("#stage").text(function(d) {
                return graph.nodes[4].name;
            });
    
            d3.select("#description").html(function(d) {
                return graph.nodes[4].text;
            });

        } else {

            d3.select("#questions").html(function(d) {
                return graph.nodes[4].output;
            });

            d3.selectAll("h3, .point-up").style("color", function(d) {
                return colors[(stepper -1)];
            });

            d3.select("#description").selectAll("*").remove();

            $("#questions p a").removeClass().addClass("step-" + stepper);

        }
        
        // GENERAL UPDATE PATTERN
        // apply to nodes and links
        node = node.data(graph.nodes);
        node.exit().remove();
        node = node.enter()
        .append("circle")
        .merge(node);

        link = link.data(graph.links, function(d) { return d.source.id + "-" + d.target.id; });
        link.exit().remove();
        link = link.enter().append("line").attr("stroke-width", function(d) { return d.value; })
        .attr("stroke", function(d) {
            return d3.rgb(colors[(stepper - 1)]).darker(0.5);
        }).merge(link);

        // UPDATE TEXT
        node.selectAll("text").remove();

        node.append("text").text(function (d) {return d.label1;})
        .attr("class", "label")
        .style("fill", function(d) {
            if (d.id !== "5") {
                return "white"; 
            } else {
                return colors[(stepper - 1)]; 
            } 
        })
        .style("font-size", function(d) {
            if (d.id !== "5") {
                return "15px"; 
            } else {
                switch(stepper) {
                    case 1:
                        return "19px";
                    case 2:
                        return  "22px";
                    case 3:
                        return  "16px";
                    case 4:
                        return  "18px";
                    case 5:
                        return  "22px";
                }
                
            }
        })
        .style("font-weight", function(d) {
            if (d.id !== "5") {
                return "normal"; 
            } else {
                return "bold";
            }
        })
        .attr('x', 0)
        .attr('y', function(d) {
            if(d.label2 !== "") {
                return -5;
            } else {
                return 5;
            }
        });

        node.append("text").text(function (d) { return d.label2;})
        .style("fill", function(d) {
            if (d.id !== "5") {
                return "white"; 
            } else {
                return colors[(stepper - 1)]; 
            } 
        })
        .attr("dy", function(d) {
            if (d.id !== "5") {
                return "1px"; 
            } else {
                return "4px";
            }
        })
        .style("font-size", function(d) {
            if (d.id !== "5") {
                return "15px"; 
            } else {
                return "19px";
            }
        })
        .style("font-weight", function(d) {
            if (d.id !== "5") {
                return "normal"; 
            } else {
                return "bold";
            }
        })
        .attr("class", "label")
        .attr('x', 0)
        .attr('y', 15);

        // UPDATE CIRCLES
        node.selectAll("circle")
        .style("fill", function(d) {
            if (d.id !== "5") {
                return colors[(stepper - 1)]; 
            } else {
                return "white";
            }
        })
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("click", mouseclick);

        // RESTART SIMULATION
        function ticked() {
    
            link
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });
    
            node
                .attr("transform", function(d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });
        }

        simulation.nodes(graph.nodes).on("tick", ticked);
        simulation.force("link").links(graph.links);
        // nb need alpha 1 or else just reset the clock
        simulation.alpha(1).restart();

    });
}

function forward () {

    switch (varState) {
        case 0:
            varState = 1;
            break;
    
        case 1:
            varState = 0;
            break;
    };

    $("#backButton").css("visibility", "visible");
    $("#forwardButton").css("visibility", "visible");

    if (varState == 0) {

        if (stepper < 5) {

            stepper++;

            $("#flow-wrapper").animate({"left": "-" + (networkWidth*(stepper-1)) + "px"}, 800);
            $("#viz-wrapper").css({"left": 0, "opacity": 0});
            $("#output").css("visibility", "hidden");

            let color1 = (colors[(stepper-2)]).slice(4, -1);
            let color2 = (colors[(stepper-1)]).slice(4, -1);

            if (stepper < 5) {
                let color3 = (colors[stepper]).slice(4, -1);
                $("#background").css({"background": "linear-gradient(to right, rgba(" + color1 + ", 0.52), rgba(" + color2 + ", 0.52), rgba(" + color3 + ", 0.52))"});
            } else {
                $("#background").css({"background": "linear-gradient(to right, rgba(" + color1 + ", 0.52), rgba(" + color2 + ", 0.52))"});
            }

            restart();

            setTimeout(function() {
                $("#viz-wrapper").animate({opacity: 1}, 800);
            }, 700);

            d3.select("#questions").selectAll("*").remove();
    
            $("#step").text("Phase " + stepper);
            $("#step").css("color", (colors[(stepper -1)]));

            // update style of progress nav
            $("#dot-nav li").removeClass("current");
            $("#dot-nav li").each(function() {
                name = $(this).find("a").text();
                if (name == stepper) {
                    $(this).addClass("current");
                }
            });
    
        }

    } else {

        $("#flow-wrapper").animate({"left": "-" + (networkWidth*((stepper -1) + 0.35)) + "px"}, 800);
        $("#viz-wrapper").animate({"left": "-" + (networkWidth*0.35) + "px", "opacity": 0.6}, 800);

        setTimeout(function() {
            $("#output").css("visibility", "visible");
        }, 500);

        // update UI but don't update chart
        d3.json("./data/data" + stepper + ".json", function(error, graph) {

            if (error) throw error;

            d3.select("#questions").html(function(d) {
                return graph.nodes[4].output;
            });

            d3.selectAll("h3, .point-up").style("color", function(d) {
                return colors[(stepper -1)];
            });

            // remove all children
            d3.select("#description").selectAll("*").remove();

            $("#questions p a").removeClass().addClass("step-" + stepper);
        });

        if (stepper == 5) {
            $("#forwardButton").css("visibility", "hidden");
        }

    }

}

function backwards () {

    switch (varState) {
        case 0:
            varState = 1;
            break;
    
        case 1:
            varState = 0;
            break;
    };

    $("#backButton").css("visibility", "visible");
    $("#forwardButton").css("visibility", "visible");

    if (varState == 0) {

        $("#flow-wrapper").animate({"left": "-" + (networkWidth*(stepper-1)) + "px"}, 800);
        $("#viz-wrapper").animate({"left": 0, "opacity": 1}, 800);
        $("#output").css("visibility", "hidden");

        // update UI but don't update chart
        d3.json("./data/data" + stepper + ".json", function(error, graph) {

            if (error) throw error;

            d3.select("#stage").text(function(d) {
                return graph.nodes[4].name;
            });

            d3.select("#description").html(function(d) {
                return graph.nodes[4].text;
            });
        });

        d3.select("#questions").selectAll("*").remove();

        if (stepper == 1) {
            $("#backButton").css("visibility", "hidden");
        }

    } else {

        if (stepper > 1) {

            stepper--;

            let color2 = (colors[(stepper-1)]).slice(4, -1);
            let color3 = (colors[stepper]).slice(4, -1);

            if (stepper > 1) {
                let color1 = (colors[(stepper-2)]).slice(4, -1);
                $("#background").css({"background": "linear-gradient(to right, rgba(" + color1 + ", 0.52), rgba(" + color2 + ", 0.52), rgba(" + color3 + ", 0.52))"});
            } else {
                $("#background").css({"background": "linear-gradient(to right, rgba(" + color2 + ", 0.52), rgba(" + color3 + ", 0.52))"});
            }

            $("#flow-wrapper").animate({"left": "-" + (networkWidth*((stepper -1) + 0.35)) + "px"}, 800);
            $("#viz-wrapper").animate({"left": "-" + (networkWidth*0.35) + "px"}, 800);
            $("#viz-wrapper").css({"opacity": 0});

            setTimeout(function() {
                $("#output").css("visibility", "visible");
            }, 500);

            restart();

            setTimeout(function() {
                $("#viz-wrapper").animate({"opacity": 0.6}, 800);
            }, 700);
    
            $("#step").text("Phase " + stepper);
            $("#step").css("color", (colors[(stepper -1)]));

            d3.json("./data/data" + stepper + ".json", function(error, graph) {

                if (error) throw error;

                d3.select("#stage").text(function(d) {
                    return graph.nodes[4].name;
                });

            });

            // update style of progress nav
            $("#dot-nav li").removeClass("current");
            $("#dot-nav li").each(function() {
                let name = $(this).find("a").text();
                if (name == stepper) {
                    $(this).addClass("current");
                }
            });

        }

    };

}

function hideIntro () {

    $("#intro").fadeTo("fast", 0, moveBehind);

    function moveBehind () {
        $("#intro").css("z-index", "-99999");
    }

}

// nav bar actions
$("#dot-nav li").on("click", function() {

    let dotName = $(this).find("a").text();

    // update style
    $("#dot-nav li").removeClass("current");
    $(this).addClass("current");
    $("#backButton").css("visibility", "visible");
    $("#forwardButton").css("visibility", "visible");

    if (dotName > stepper) {

        stepper = parseInt(dotName);
        varState = 0;

        $("#flow-wrapper").animate({"left": "-" + (networkWidth*(stepper-1)) + "px"}, 800);
        $("#viz-wrapper").css({"left": 0, "opacity": 0});
        $("#output").css("visibility", "hidden");

        let color1 = (colors[(stepper-2)]).slice(4, -1);
        let color2 = (colors[(stepper-1)]).slice(4, -1);

        if (stepper < 5) {
            let color3 = (colors[stepper]).slice(4, -1);
            $("#background").css({"background": "linear-gradient(to right, rgba(" + color1 + ", 0.52), rgba(" + color2 + ", 0.52), rgba(" + color3 + ", 0.52))"});
        } else {
            $("#background").css({"background": "linear-gradient(to right, rgba(" + color1 + ", 0.52), rgba(" + color2 + ", 0.52))"});
        }

        restart();

        setTimeout(function() {
            $("#viz-wrapper").animate({opacity: 1}, 800);
        }, 700);

        d3.select("#questions").selectAll("*").remove();

        $("#step").text("Phase " + stepper);
        $("#step").css("color", (colors[(stepper -1)]));

    } else if (dotName < stepper) {

        stepper = parseInt(dotName);
        varState = 0;

        $("#flow-wrapper").animate({"left": "-" + (networkWidth*(stepper-1)) + "px"}, 800);
        $("#viz-wrapper").css({"left": 0, "opacity": 0});
        $("#output").css("visibility", "hidden");

        let color2 = (colors[(stepper-1)]).slice(4, -1);
        let color3 = (colors[stepper]).slice(4, -1);

        if (stepper > 1) {
            let color1 = (colors[(stepper-2)]).slice(4, -1);
            $("#background").css({"background": "linear-gradient(to right, rgba(" + color1 + ", 0.52), rgba(" + color2 + ", 0.52), rgba(" + color3 + ", 0.52))"});
        } else {
            $("#background").css({"background": "linear-gradient(to right, rgba(" + color2 + ", 0.52), rgba(" + color3 + ", 0.52))"});
        }

        restart();

        setTimeout(function() {
            $("#viz-wrapper").animate({opacity: 1}, 800);
        }, 700);

        d3.select("#questions").selectAll("*").remove();

        $("#step").text("Phase " + stepper);
        $("#step").css("color", (colors[(stepper -1)]));

        if (stepper == 1) {
            $("#backButton").css("visibility", "hidden");
        }

    } else {
        // do nothing when equal
    }

});
