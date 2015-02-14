    /*----------------------
    Helpers
    ----------------------*/

    function isObject(obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    };

    function clone(obj) {
        if (null == obj || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (isObject(obj[attr])) copy[attr] = clone(obj[attr]); // mja
            else if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }



    var AppView = Backbone.View.extend({

        el: $("#app"),

        events: {
            "click #editor-button": "toggleEditor",
        },

        initialize: function() {

            var throttled = _.throttle(
                function(){
                    inputCollection.trigger('change'); // trigger redraw
                }, 
                500, 
                {leading: false} 
            );
            $(window).bind("resize.app", _.bind(throttled, this));

            this.listenTo(inputCollection, 'add', this.addInput);

            var view = this;

            /*----------------------
            Ace editor
            ----------------------*/

            var language_tools = ace.require("ace/ext/language_tools");
            editor.setOptions({
                enableBasicAutocompletion: true,
                enableSnippets: true,
                enableLiveAutocompletion: true
            });

            editor.getSession().setMode("ace/mode/javascript");
            editor.setTheme("ace/theme/twilight");


            // ace editor is its own model and view
            editor.on('change', function() {

                // this loads users script which should define inputs and model
                // equivalent to eval but ensures inputs and model are global
                // eval(editor.getSession().getValue());
                var oldScript = document.getElementById('model-input-script');
                oldScript && oldScript.parentNode.removeChild(oldScript);
                var code = editor.getSession().getValue();
                var script = document.createElement('script');
                script.id = 'model-input-script';
                try {
                  script.appendChild(document.createTextNode(code));
                  document.body.appendChild(script);
                } catch (e) {
                  script.text = code;
                  document.body.appendChild(script);
                }


                // remove old inputs
                var temp_model;
                while (temp_model = inputCollection.first()) {
                    temp_model.destroy();
                }
                // add new
                inputCollection.add(inputs);


                if (inputs){
                    // render legend
                    d3.selectAll("#legend div").remove();
                    var legend = d3.selectAll("#legend").append('div');

                    // TODO duplication
                    // var inputs = inputCollection.toJSON();
                    var outputs = Object.keys(model(inputs));
                    var color = d3.scale.ordinal().range(["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628","#f781bf","#999999"]).domain(outputs);

                    for (var i = 0; i < outputs.length; i++) {
                        legend.append('div').attr('class','legend-box').style('background-color', color(outputs[i]));
                        legend.append('div').attr('class','legend-label').html(outputs[i]);
                    };
                }


            });


        },

        remove: function(){
            // unbind
            $(window).off("resize.app"); 

            // the original remove() function
            Backbone.View.prototype.remove.call(this);

        },

    /*----------------------
    Nav
    ----------------------*/
        toggleEditor: function() {
            var icon = this.$("#editor-button i");
            if (icon.hasClass('fa-code')) {
                icon.toggleClass('fa-code', false);
                icon.toggleClass('fa-times', true);
                $("#editor").toggleClass('hidden', false);
            } else {
                icon.toggleClass('fa-times', false);
                icon.toggleClass('fa-code', true);
                $("#editor").toggleClass('hidden', true);
            }
        },

        addInput: function(input) {
            var view = new InputView({
                model: input,
                el: d3.select("#graphs").append('div').attr('class', 'block').node()
            });
            view.render();
        },

    });



    var InputView = Backbone.View.extend({
        // tagname: "div",
        // className: "block",

        events: {
            // Note: drag event is done d3 style below

        },

        initialize: function() {
            this.listenTo(this.model.collection, "change", this.render);
            this.listenTo(this.model, "destroy", this.remove);

        },

        render: function() {

            var this_model = this.model;

            var el = d3.select(this.el);

            el.selectAll('svg').remove();

            var input = this.model.toJSON();
            var inputs = this.model.collection.toJSON();
            var outputs = Object.keys(model(inputs));

            var index = this.model.collection.indexOf(this.model);

            /*----------------------
            Set up plot 
            ----------------------*/

            var margin = {
                    top: 20,
                    right: 20,
                    bottom: 60,
                    left: 60
                },
                width = el.node().clientWidth - margin.left - margin.right,
                height = el.node().clientWidth - margin.top - margin.bottom;

            var x = d3.scale.linear()
                .range([0, width]);

            var y = d3.scale.linear()
                .range([height, 0]);

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left");

            var line = d3.svg.line()
                .x(function(d) {
                    return x(d.x);
                })
                .y(function(d) {
                    return y(d.y);
                });

            var svg = el.append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var color = d3.scale.ordinal().range(["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628","#f781bf","#999999"]).domain(outputs);


            /*----------------------
            Create data and plot it
            ----------------------*/

            var points = 100;

            var step = (input.max - input.min) / points;
            var domain = [];
            for (var i = 0; i < points; i++) {
                domain.push(input.min + i * step);
            };


            var data = outputs.map(function(output) {
                // clone so as not to change initial values
                var temp_inputs = clone(inputs);

                return {
                    name: output,
                    data: domain.map(function(d) {
                        temp_inputs[index].val = d; // changes object
                        return {
                            x: d,
                            y: model(temp_inputs)[output]
                        };
                    })
                };

            });

            x.domain([
                d3.min(data, function(l) {
                    return d3.min(l.data, function(d) {
                        return d.x;
                    });
                }),
                d3.max(data, function(l) {
                    return d3.max(l.data, function(d) {
                        return d.x;
                    });
                })
            ]);

            y.domain([
                d3.min(data, function(l) {
                    return d3.min(l.data, function(d) {
                        return d.y;
                    });
                }),
                d3.max(data, function(l) {
                    return d3.max(l.data, function(d) {
                        return d.y;
                    });
                })
            ]);

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);                
                // .append("text")
                // .attr("y", 25)
                // .attr("x", width/2)
                // .attr("dy", ".71em")
                // .style("text-anchor", "middle")
                // .text(input.name);

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis);
                // .append("text")
                // .attr("transform", "rotate(-90)")
                // .attr("y", 6)
                // .attr("dy", ".71em")
                // .style("text-anchor", "end")
                // .text("Price ($)");

            for (var i = 0; i < data.length; i++) {
                svg.append("path")
                    .datum(data[i].data)
                    .attr("class", "line")
                    .style('stroke', color(data[i].name))
                    .attr("d", line);
            }

            svg.append("text")
                .attr("y", 0)
                .attr("x", width/2)
                // .attr("dy", ".71em")
                .style("text-anchor", "middle")
                .text(input.name);

            var value = svg.append('text')
                .style("text-anchor", "middle")
                .attr("transform", "translate("+(width/2) + ",20)")
                .text(input.val.toFixed(2));


            /*----------------------
            Hover/ Drag
            ----------------------*/

            var drag = d3.behavior.drag()
                .on("drag", mousemove)
                .on("dragend", function() {
                    this_model.set(input);
                });
            // TODO

            var bisectX = d3.bisector(function(d) {
                return d.x;
            }).left;

            var focus = svg.selectAll(".focus")
                .data(outputs)
                .enter()
                .append("g")
                .attr("class", "focus")
                .attr("transform", function(e, j) {
                    return "translate(" + x(input.val) + "," + y(model(inputs)[e]) + ")";
                });

            focus.append("circle")
                .style('stroke', function(d) {
                    return color(d);
                })
                .attr("r", width / 100);

            // focus.append("text")
            //     .attr("x", 9)
            //     .attr("dy", ".35em")
            //     .text(function(e, j) {
            //         return model(inputs)[e].toFixed(2);
            //     });

            svg.append("rect")
                .attr("class", "overlay")
                .attr("width", width)
                .attr("height", height)
                .call(drag);

            function mousemove() {
                var x0 = x.invert(d3.mouse(this)[0]),
                    i = bisectX(data[0].data, x0, 1),
                    d0 = data[0].data[i - 1],
                    d1 = data[0].data[i],
                    i_b = x0 - d0.x > d1.x - x0 ? i : i - 1;

                input.val = x0 - d0.x > d1.x - x0 ? d1.x : d0.x;

                value.text(input.val.toFixed(2));


                focus.attr("transform", function(e, j) {
                    return "translate(" + x(data[j].data[i_b].x) + "," + y(data[j].data[i_b].y) + ")";
                });
                // focus.select("text").text(function(e, j) {
                //     return data[j].data[i_b].y.toFixed(2)
                // });


            }

            return this;

        }

    });