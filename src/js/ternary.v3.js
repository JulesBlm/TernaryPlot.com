/*
  d3-ternary: MIT License
  Copyright (c) 2018 Daven Quinn

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function() {
  var _plotBounds; var angles; var cos30; var line; var path; var randomid;

  path = void 0;

  d3.ternary = {};

  cos30 = Math.sqrt(3) / 2;

  tickValues = [.2, .4, .6, .8, 1];

  randomid = function() {
    var i, j, pos, possible, text;
    text = "";
    possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    for (i = j = 0; j <= 3; i = ++j) {
      pos = Math.floor(Math.random() * possible.length);
      text += possible.charAt(pos);
    }
    return text;
  };

  line = function(interpolator) {
    if (!interpolator) {
      interpolator = 'linear';
    }
    return path = d3.svg.line()
      .x(function(d) { return d[0]; })
      .y(function(d) { return d[1]; })
      .interpolate(interpolator);
  };

  angles = [0, 120, 240];

  /* ----- Graticules ----- */
  d3.ternary.graticule = function() {
    var graticule, majorInterval, majorTicks, minorInterval, minorTicks;
   
    majorInterval = 0.1; //Stepsize for lines
    minorInterval = null;

    majorTicks = function() {
      var int, start, ticks;
      ticks = [];
      int = majorInterval;
      start = int;
      while (start < 1) {
        ticks.push(start);
        start += int;
      }

      // console.log("ticks", ticks);

      return ticks;
    };

    minorTicks = function() {
      var start, ticks;
      ticks = [];
      if (minorInterval == null) {
        return ticks;
      }
      start = minorInterval;
      while (start < 1) {
        if (start % majorInterval !== 0) {
          ticks.push(start);
        }
        start += minorInterval;
      }
      return ticks;
    };

    graticule = function(plot) {
      var axisGraticule, gratAxes;
      gratAxes = [0, 1, 2].map(function() {
        return d3.svg.axis()
              .tickValues(majorTicks());
      });
      axisGraticule = function(axis, i) {
        var container, draw, selA, selB;
        container = d3.select(this);
        
        selA = container.selectAll("path.minor").data(minorTicks());
        selA.enter().append("path")
          .attr("class", `minor axis-${i}`  );

        selB = container.selectAll("path.major").data(majorTicks());
        selB.enter().append("path")
          .attr("class", `major axis-${i}`  );

        draw = function() {
          // console.log("plot.rule(i)", plot.rule(i));
          axis.scale(plot.scales[i]);
          selA.attr("d", plot.rule(i));

          return selB.attr("d", plot.rule(i));
        };

        plot.on("resize." + (randomid()), draw);
        return draw();
      };
      
      return plot.axes()
              .selectAll(".graticule")
              .data(gratAxes)
              .enter().append("g")
                .attr("class", "graticule")
                .each(axisGraticule);
    };

    graticule.axes = function() {
      return gratAxes;
    };

    graticule.majorInterval = function(d) {
      if (!d) {
        return majorInterval;
      }
      majorInterval = d;
      return graticule;
    };

    graticule.minorInterval = function(d) {
      if (!d) {
        return minorInterval;
      }
      minorInterval = d;
      return graticule;
    };
    return graticule;
  };

  /* ----- Scalebars ----- */
  d3.ternary.scalebars = function(opts) {
    var adjustText, axes, formatLabel, labels, plot, scalebar;
    
    if (opts == null) {
      opts = {};
    }

    // console.log("Calling scalebar");
    plot = null;
    labels = opts.labels || null;

    axes = [0, 1, 2].map(function(i) {
      return d3.svg.axis()
              .tickSize(10)
              .tickFormat(d3.format("%"))
              .tickValues(tickValues)
              .orient("top");
    });

    adjustText = function(d, i) {

      // Set left axis ticklabels straight
      if (i === 0) {
        return d3.select(this).selectAll("text")
          .attr("transform", function(d) {
            const y = d3.select(this).attr("y");
            return "translate(22 " + (-y) + ") rotate(60 0 " + (4.5 * y) + ")"; //-180
          }) && d3.select(this).selectAll("line")
                .attr("transform", function(d) {
            const y = d3.select(this).attr("y");
            return "translate(0 " + (-y) + ") rotate(-30 0 " + (1 * y) + ")"; //-180
          });;
      }

      return d3.select(this).selectAll("text")
        .attr("transform", function(d) {
          const y = d3.select(this).attr("y");
          return "translate(-27 " + (-y) + ") rotate(-120 0 " + (2.5 * y) + ")"; //-180
        }) && d3.select(this).selectAll("line")
                .attr("transform", function(d) {
            const y = d3.select(this).attr("y");
            return "translate(0 " + (-y) + ") rotate(-30 0 " + (1 * y) + ")"; //-180
          });;
    };

    formatLabel = function(d, i) {
      var dy, t, width;
      width = plot.width();
      dy = -30;
      t = "translate(" + (width / 2) + ")";
      if (i === 2) {
        dy = 42;
        t = " rotate(-180 0 0) translate(" + (-width / 2) + ")";
      }
      return d3.select(this)
        .attr("class", "label")
        .attr("transform", t)
        .attr("y", dy)
        .attr("text-anchor", "middle")
        .text(d);
    };

    // console.info("formatLabel", formatLabel);

    scalebar = function(p) {
      var b_axes, draw;
      // console.log("Adding scalebar to plot");
      plot = p;
      b_axes = plot.axes().selectAll(".bary-axis").data(angles).enter().append("g")
        .attr("class", function(d, i) {
          d = "bary-axis";
          if (i === 2) {
            d += ' bottom';
          }
          return d;
        });

      b_axes.each(function() {
        return d3.select(this).append("text")
          .attr("class", "label");
      });

      draw = function() {
        var labelSel, offs, r;

        axes.forEach(function(axis, i) {
          var d, s;
          s = plot.scales[i].copy();
          /* To reverse bottom axis (?)
          if (i === 2) {
            d = s.domain();
            s.domain(d).reverse()
          }
          */
          return axis.scale(s);
        });

        r = plot.radius();
        offs = plot.center();

        b_axes.each(function(d, i) {
          var el;
          el = d3.select(this);
          return axes[i](el);
        }).attr("transform", function(d, i) {
            const x = offs[0];
            const y = offs[1];

            return "rotate(" + (-60 + i * 120) + " " + x + " " + y + ") translate(0 " + (r / 2) + ")"; //"rotate(" + (-60 + i * 120) + " " + x + " " + y + ") translate(0 " + (r / 2) + ")";
          }
        ).each(adjustText);

        if (labelSel) return labelSel = plot.axes().selectAll('.bary-axis .label').data(labels).each(formatLabel);
      };
      plot.on("resize." + (randomid()), draw);
      return draw();
    };

    scalebar.labels = function(l) {
      if (l == null) {
        return labels;
      }
      labels = l;
      return scalebar;
    };
    scalebar.axes = axes;
    return scalebar;
  };

  /* ----- Vertex abels ----- */
  d3.ternary.vertexLabels = function(labels) {
    var sel = null;
    var rotate = [0, 60, -60];
    var pad = 20;

    var L = function(plot) {
      var data, draw, verts;
      verts = plot.vertices(pad);
      data = labels.map(function(l, i) {
        return {
          label: l,
          vertex: verts[i]
        };
      });
      sel = plot.axes().selectAll(".vertex-label").data(data);
      sel.enter().append("text").text(function(d) { return d.label;})
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .attr("class", (d) =>  `vertex-label${String(d.label).toLowerCase()}` );

      draw = function() {
        return sel.attr({
          transform: function(d, i) {
            var ref, x, y;
            ref = d.vertex, x = ref[0] , y = ref[1];
            return "translate(" + x + "," + y + ")rotate(" + rotate[i] + ")";
          }
        });
      };

      plot.on("resize." + (randomid()), draw);
      draw();
      return sel;
    };

    return L;
  };

  /* ----- Neatline ----- */
  d3.ternary.neatline = function() {
    var neatline;
    neatline = function(plot) {
      var el;
      return el = plot.node().append("use")
        .attr("class", "neatline")
        .attr("xlink:href", "#bounds");
      };

    return neatline;
  };

  _plotBounds = function(plot) {
    var _, a, domains, draw, el, i, j, points, v;
    domains = plot.scales.map(function(s) {
      return s.domain();
    });

    // console.log("domains", domains);
    points = [];
    for (i = j = 0; j <= 2; i = ++j) {
      v = i - 1;
      if (v === -1) {
        v = 2;
      }
      a = domains.map(function(d) {
        return d[0];
      });
      a[v] = domains[v][1];
      points.push(a);
      a = domains.map(function(d) {
        return d[0];
      });
      a[i] = domains[i][1];
      points.push(a);
    }

    _ = d3.select(this);
    el = _.select("#bounds");
    if (el.node() == null) {
      el = _.append("polygon");
    }
    el.datum(points).attr({
      id: 'bounds'
    });
    draw = function() {
      return el.attr({
        points: function(d) {
          var di;
          di = d.map(function(c) {
            i = plot.rawPoint(c);
            return i.join(",");
          });
          return di.join(" ");
        }
      });
    };
    plot.on("resize." + (randomid()), draw);
    return draw();
  };

  d3.ternary.plot = function() {
    var T, axes, callOnCreate, defs, events, height, innerHeight, innerWidth, margin, outerHeight, outerWidth, plot, radius, rescaleView, scales, shouldClip, svg, width;
    
    // Dimensions
    outerWidth = 500;
    outerHeight = 500;
    margin = {
      top: 50,
      bottom: 50,
      left: 50,
      right: 50
    };
    radius = null;
    height = null;
    width = null;
    
    svg = null;
    axes = null;
    plot = null;
    defs = null;
    shouldClip = false;
    callOnCreate = [];
    
    scales = [0, 1, 2].map(function() {
      return d3.scale.linear().domain([0, 1]).range([0, 1]);
    });
    events = d3.dispatch("resize");

    innerWidth = function(w) {
      return w - margin.left - margin.right;
    };

    innerHeight = function(h) {
      return h - margin.top - margin.bottom;
    };

    rescaleView = function() {
      var center, j, len, s;
      if (width == null) {
        width = innerWidth(outerWidth);
      }
      if (height == null) {
        height = innerHeight(outerHeight);
      }
      if (radius == null) {
        radius = width / Math.sqrt(3);
      }
      center = [width / 2, radius];
      if (svg == null) {
        return;
      }
      svg.attr({
        transform: "translate(" + margin.left + "," + margin.top + ")",
        width: width,
        height: height
      });
      d3.select(svg.node().parentElement).attr({
        width: outerWidth,
        height: outerHeight
      });

      for (j = 0, len = scales.length; j < len; j++) {
        s = scales[j];
        s.range([0, width]);
      }
      _plotBounds.call(defs.node(), T);
      // if (shouldClip) {
      //   plot.attr({'clip-path': "url(#axesClip)"});
      // }
      return events.resize();
    };

    T = function(el) {
      svg = el.append("g");
      defs = svg.append('defs');
      axes = svg.append('g').attr('id', 'axes');
      plot = svg.append('g').attr('id', 'plot')
        // .attr('clip-path', "url(#axesClip)");      
      ;
      rescaleView();
      defs.append('clipPath')
        .attr({ id: 'axesClip' })
        .append('use')
          .attr({'xlink:href': "#bounds"});
      // console.log("Calling plot functions");

      if (callOnCreate) {
        callOnCreate.forEach(function(f) {
           return f(T);
       });
      }
      return callOnCreate = [];
    };

    T.on = function(n, f) {
      return events.on(n, f);
    };

    T.fit = function(w, h) {
      var nh, nw, r;
      if (arguments.length === 2) {
        nw = innerWidth(w);
        nh = innerHeight(h);
        if (nh <= cos30 * nw) {
          r = nh * 2 / 3;
        } else {
          r = nw / Math.sqrt(3);
        }
      } else {
        r = nw / Math.sqrt(3);
      }
      T.radius(r);
      return T;
    };

    T.node = function() {
      return svg;
    };

    T.axes = function() {
      return axes;
    };

    T.plot = function() {
      return plot;
    };

    T.call = function(f) {
      if (svg != null) {
        f(T);
      } else {
        callOnCreate.push(f);
      }
      return T;
    };

    T.scales = scales;
    T.margin = function(m) {
      if (m == null) {
        return margin;
      }
      if (m.left != null) {
        margin = m;
      } else {
        margin = {
          left: m,
          right: m,
          top: m,
          bottom: m
        };
      }
      rescaleView();
      return T;
    };

    T.point = function(coords) {
      var sum;
      sum = d3.sum(coords);
      if (sum !== 0) {
        coords = coords.map(function(d) {
          return d / sum;
        });
      }
      return T.rawPoint(coords);
    };

    T.rawPoint = function(d) {
      var A, B, C, a, b, c, x, y;
      if (d3.sum(d) === 0) {
        return [0, 0];
      }
      A = scales[0], B = scales[1], C = scales[2];
      a = d[0], b = d[1], c = d[2];
      x = A(a) / 2 + B(b);
      y = B((1 - a) * cos30);
      return [x, y];
    };

    T.value = function(arg) {
      var A, B, C, a, b, c, x, y;
      x = arg[0], y = arg[1];
      A = scales[0], B = scales[1], C = scales[2];
      a = 1 - B.invert(y) / cos30;
      b = B.invert(x - A(a) / 2);
      c = 1 - a - b;
      return [a, b, c];
    };

    T.path = (function(_this) {
      return function(coordsList, accessor, interpolator) {
        var positions;
        line(interpolator);
        if (!accessor) { accessor = function(d) { return d; }; }

        positions = coordsList.map(function(d) { return T.point(accessor(d)); });
        
        return path(positions);
      };
    })(this);

    T.area = (function(_this) {
      // console.log("t.path _this", _this);

      return function(coordsList, accessor, interpolator) {
        // console.log("d3-TERNARY: coordsList",coordsList);
        var positions;
        line(interpolator);
        if (!accessor) { accessor = function(d) { return d; }; }

        positions = coordsList.map(function(d) { return T.point(accessor(d)); });
        
        // console.log("positions", positions);
        // console.log("path(positions", path(positions));

        return path(positions) + "Z"; // closes the path
      };
    })(this);    

    T.rule = function(axis) {
      return function(value) {
        var ends;
        ends = [];

        if (axis === 0) {
          ends = [[0, 1 - value, value], [1 - value, 0, value]];
        } else if (axis === 1) {
          ends = [[0, value, 1 - value], [1 - value, value, 0]];
        } else if (axis === 2) {
          ends = [[value, 0, 1 - value], [value, 1 - value, 0]];
        }

        // console.log("ends", ends);
        // console.log("T.path(ends)", T.path(ends));

        return T.path(ends);
      };
    };

    T.vertices = function(pad) {
      var rotate;
      if (pad == null) {
        pad = 0;
      }
      rotate = [0, -120, 120];
      return rotate.map(function(d) {
        var a, x, y;
        a = d * Math.PI / 180;
        x = width / 2 + Math.sin(a) * (radius + pad);
        y = radius - Math.cos(a) * (radius + pad);
        return [x, y];
      });
    };

    T.range = function(range) {
      return T;
    };

    T.radius = function(r) {
      if (r != null) {
        radius = r;
        height = r * 3 / 2;
        width = r * Math.sqrt(3);
        outerHeight = height + margin.top + margin.bottom;
        outerWidth = width + margin.left + margin.right;
        rescaleView();
      } else {
        return radius;
      }
      return T;
    };

    T.center = function() {
      return [width / 2, radius];
    };

    T.height = function() {
      return height;
    };

    T.width = function() {
      return width;
    };

    T.clip = function(c) {
      if (c == null) {
        return shouldClip;
      }
      shouldClip = c;
      return T;
    };
    return T;
  };

}).call(this);

module.exports = d3.ternary;