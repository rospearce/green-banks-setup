const svg = d3.select("svg"),
    width = +svg.style('width').slice(0, -2),
    height = +svg.style("height").slice(0, -2);
    color = d3.scaleOrdinal(d3.schemeCategory10);

console.log(width);
console.log(height);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force('charge', d3.forceManyBody()
        .strength(-2000)
        .theta(0.8)
        // .distanceMax(400)
    )
    .force("center", d3.forceCenter(width / 2, height / 2));

var node;
var link;
var circles;
var label1;
var label2;

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
        .attr("fill", function(d) { return color(d.group); })
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

    simulation.nodes(graph.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(graph.links);

    function ticked() {
        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node
            .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
            })
    }
    });

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

let step = 2;

function restart() {

    d3.json("./data/data" + step + ".json", function(error, graph) {
        if (error) throw error;

        console.log(step);
        
        // Apply the general update pattern to the nodes.
        node = node.data(graph.nodes);
        node.exit().remove();
        node = node.enter()
        .append("circle").attr("fill", function(d) { return color(d.id); })
        .merge(node);

        // Apply the general update pattern to the links.
        link = link.data(graph.links, function(d) { return d.source.id + "-" + d.target.id; });
        link.exit().remove();
        link = link.enter().append("line").merge(link);

        node.selectAll("text").remove();

        node.append("text").text(function (d) {
            console.log(d.label1);
            return d.label1;
        })
        .attr("class", "label")
        .attr('x', 0)
        .attr('y', -10);

        node.append("text").text(function (d) { return d.label2;})
        .attr("class", "label")
        .attr('x', 0)
        .attr('y', 10);

        // Apply the general update pattern to the labels.
        // label1 = label1.data(graph.nodes, function(d) { return d.label1;});
        // label1.exit().remove();
        // label1 = label1.enter().append("text").text(function(d) {
        //     return d.label1;
        // }).merge(label1);
        // node.append(label1);

        // Update and restart the simulation.
        simulation.nodes(graph.nodes);
        simulation.force("link").links(graph.links);
        simulation.restart();

    });
}

setTimeout(function(){ restart(step); }, 2000);