"use strict";
/*jshint node: true */

d3.chart("Sankey.Base").extend("Sankey", {

  initialize: function() {
    var chart = this;

    chart.d3.sankey = d3.sankey();
    chart.d3.path = chart.d3.sankey.link();
    chart.d3.sankey.size([chart.features.width, chart.features.height]);

    chart.features.iterations = 32;
    chart.features.nodeWidth = chart.d3.sankey.nodeWidth();
    chart.features.nodePadding = chart.d3.sankey.nodePadding();

    chart.layers.links = chart.layers.base.append("g").classed("links", true);
    chart.layers.nodes = chart.layers.base.append("g").classed("nodes", true);


    chart.on("change:sizes", function() {
      chart.d3.sankey.nodeWidth(chart.features.nodeWidth);
      chart.d3.sankey.nodePadding(chart.features.nodePadding);
    });

    chart.layer("links", chart.layers.links, {
      dataBind: function(data) {
        return this.selectAll(".link").data(data.links);
      },

      insert: function() {
        return this.append("path").classed("link", true);
      },

      events: {
        "enter": function() {
          this
            .attr("d", chart.d3.path)
            .style("stroke", colorLinks)
            .style("stroke-width", function(d) { return Math.max(1, d.dy); })
            .sort(function(a, b) { return b.dy - a.dy; });

          this.on("mouseover", function(e) { chart.trigger("link:mouseover", e); });
          this.on("mouseout",  function(e) { chart.trigger("link:mouseout",  e); });
          this.on("click",     function(e) { chart.trigger("link:click",     e); });
        }
      }
    });

    chart.layer("nodes", chart.layers.nodes, {
      dataBind: function(data) {
        return this.selectAll(".node").data(data.nodes);
      },

      insert: function() {
        return this.append("g").classed("node", true);
      },

      events: {
        "enter": function() {
          this.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

          this.append("rect")
            .attr("height", function(d) { return d.dy; })
            .attr("width", chart.features.nodeWidth)
            .style("fill", colorNodes)
            .style("stroke", function(d) { return d3.rgb(colorNodes(d)).darker(2); });

          this.append("text")
            .attr("x", -6)
            .attr("y", function(d) { return d.dy / 2; })
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .attr("transform", null)
            .text(chart.features.name)
            .filter(function(d) { return d.x < chart.features.width / 2; })
              .attr("x", 6 + chart.features.nodeWidth)
              .attr("text-anchor", "start");

          this.on("mouseover", function(e) { chart.trigger("node:mouseover", e); });
          this.on("mouseout",  function(e) { chart.trigger("node:mouseout",  e); });
          this.on("click",     function(e) { chart.trigger("node:click",     e); });
        }
      }
    });

    function colorNodes(node) {
      if (typeof chart.features.colorNodes === 'function') {
        // allow using d3 scales, but also custom function with node as 2nd argument
        return chart.features.colorNodes(chart.features.name(node), node);
      } else {
        return chart.features.colorNodes;
      }
    }

    function colorLinks(link) {
      if (typeof chart.features.colorLinks === 'function') {
        // always expect custom function, there's no sensible default with d3 scales here
        return chart.features.colorLinks(link);
      } else {
        return chart.features.colorLinks;
      }
    }
  },


  transform: function(data) {
    var chart = this;

    chart.d3.sankey
      .nodes(data.nodes)
      .links(data.links)
      .layout(chart.features.iterations);

    return data;
  },


  iterations: function(_) {
    if (!arguments.length) { return this.features.iterations; }
    this.features.iterations = _;

    if (this.data) { this.draw(this.data); }

    return this;
  },


  nodeWidth: function(_) {
    if (!arguments.length) { return this.features.nodeWidth; }
    this.features.nodeWidth = _;

    this.trigger("change:sizes");
    if (this.data) { this.draw(this.data); }

    return this;
  },


  nodePadding: function(_) {
    if (!arguments.length) { return this.features.nodePadding; }
    this.features.nodePadding = _;

    this.trigger("change:sizes");
    if (this.data) { this.draw(this.data); }

    return this;
  },

});