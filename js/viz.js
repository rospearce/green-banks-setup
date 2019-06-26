const svg = d3.select("svg"),
    width = +svg.style('width').slice(0, -2),
    height = +svg.style("height").slice(0, -2);
    colors = ["rgb(67,207,239)", "rgb(206,209,204)", "rgb(164,94,219)", "rgb(204,155,122)", "rgb(221,84,182)"];

var simulation = d3.forceSimulation()
    .force("link", 
        d3.forceLink().distance(100).id(function(d) { return d.id; })
    )
    .force('charge', d3.forceManyBody()
        .strength(-2200)
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
            .attr("stroke", "gray");
    
        node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(graph.nodes)
            .enter().append("g");
            
        circles = node.append("circle")
            .attr("r", 40)
            .style("fill", function(d) {
                if (d.id !== "5") {
                    return colors[(stepper - 1)]; 
                } else {
                    return "white";
                }
            })
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .on("click", mouseclick)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));
    
        // hacky way of getting two lines without bothering with html
        label1 = node.append("text")
            .text(function(d) {
                return d.label1;
            })
            .attr("class", "label")
            .attr('x', 0)
            .attr('y', -5);
    
        label2 = node.append("text")
            .text(function(d) {
                return d.label2;
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

        if (varState == 0) {

            d3.select("#stage").text(function(d) {
                return graph.nodes[4].name;
            });
    
            d3.select("#description").html(function(d) {
                return graph.nodes[4].text;
            });

        } else {

            d3.select("#stage").text("Output");

            d3.select("#description").html(function(d) {
                return graph.nodes[4].output;
            });

            d3.select("#questions").selectAll("*").remove();

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
        .attr("stroke", "gray").merge(link);

        // UPDATE TEXT
        node.selectAll("text").remove();

        node.append("text").text(function (d) {
            return d.label1;
        })
        .attr("class", "label")
        .attr('x', 0)
        .attr('y', function(d) {
            if(d.label2 !== "") {
                return -5;
            } else {
                return 5;
            }
        });

        node.append("text").text(function (d) { return d.label2;})
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
        .on("click", mouseclick)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

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

    console.log(varState);

    $("#backButton").css("visibility", "visible");
    $("#forwardButton").css("visibility", "visible");

    if (varState == 0) {

        if (stepper < 5) {

            stepper++;
    
            $("#viz").children().fadeOut("slow", function() {
                setTimeout(function() {
                    $("#viz").children().fadeIn("slow");
                }, 400);
            });
    
            setTimeout(function() {
                restart(varState);
            }, 500);
    
            $("#step").text(stepper);
    
        }

    } else {

        // update UI but don't update chart
        d3.json("./data/data" + stepper + ".json", function(error, graph) {

            if (error) throw error;

            d3.select("#stage").text("Output");

            d3.select("#description").html(function(d) {
                return graph.nodes[4].output;
            });

            // remove all children
            d3.select("#questions").selectAll("*").remove();
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

    console.log(varState);

    $("#backButton").css("visibility", "visible");
    $("#forwardButton").css("visibility", "visible");

    if (varState == 0) {

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

        if (stepper == 1) {
            $("#backButton").css("visibility", "hidden");
        }

    } else {

        if (stepper > 1) {

            stepper--;
    
            $("#viz").children().fadeOut("slow", function() {
                setTimeout(function() {
                    $("#viz").children().fadeIn("slow");
                }, 400);
            });
    
            setTimeout(function() {
                restart();
            }, 500);
    
            $("#step").text(stepper);
        }

    };

}