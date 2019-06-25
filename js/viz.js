const svg = d3.select("svg"),
    width = +svg.style('width').slice(0, -2),
    height = +svg.style("height").slice(0, -2);
    colors = ["#43cfef", "#ced1cc", "#a45edb", "#cc9b7a", "#dd54b6"];

console.log(width);
console.log(height);

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
let step = 1;

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
            .attr("fill", function(d) {
                if (d.id !== "5") {
                    return colors[(step - 1)]; 
                } else {
                    return "white";
                }
            })
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
            .attr('y', -10);
    
        label2 = node.append("text")
            .text(function(d) {
                return d.label2;
            })
            .attr("class", "label")
            .attr('x', 0)
            .attr('y', 10);
    
        
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
    
            // setTimeout(function(){ 
            //     graph.nodes[0].fx = width / 2;
            //     graph.nodes[0].fy = height / 2;; 
            // }, 1000);
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

function restart() {

    d3.json("./data/data" + step + ".json", function(error, graph) {
        if (error) throw error;
        
        // Apply the general update pattern to the nodes.
        node = node.data(graph.nodes);
        node.exit().remove();
        node = node.enter()
        .append("circle")
        .merge(node);

        // Apply the general update pattern to the links.
        link = link.data(graph.links, function(d) { return d.source.id + "-" + d.target.id; });
        link.exit().remove();
        link = link.enter().append("line").attr("stroke-width", function(d) { return d.value; })
        .attr("stroke", "gray").merge(link);

        node.selectAll("text").remove();

        node.append("text").text(function (d) {
            return d.label1;
        })
        .attr("class", "label")
        .attr('x', 0)
        .attr('y', function(d) {
            if(d.label2 !== "") {
                return -10;
            } else {
                return 0;
            }
        });

        // update text
        node.append("text").text(function (d) { return d.label2;})
        .attr("class", "label")
        .attr('x', 0)
        .attr('y', 10);

        // update circle colour
        node.selectAll("circle")
        .attr("fill", function(d) {
            if (d.id !== "5") {
                return colors[(step - 1)]; 
            } else {
                return "white";
            }
        });

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

        // Update and restart the simulation.
        simulation.nodes(graph.nodes).on("tick", ticked);
        simulation.force("link").links(graph.links);
        simulation.alpha(1).restart();

    });
}

function forward () {
    console.log("forward");

    if (step < 6) {
        step++;
        console.log(step);
        //$("#viz").children().animate({opacity: 0}, 500);
        setTimeout(function() {
            restart();
        }, 1000);
    } else {
        // do nothing
    }

}

function backwards () {

    console.log("backwards");

    if (step > 1) {
        step--;
        console.log(step);
        //$("#viz").children().animate({opacity: 0}, 500);
        setTimeout(function() {
            restart();
        }, 1000);
    } else {
        // do nothing
    }

}

// setTimeout(function(){ 
//     step = 2;
//     restart(); 
// }, 4000);