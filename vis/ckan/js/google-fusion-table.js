// extends src/nodes/masher.js which extends src/node-box-native-view.js

$(function () {

    var tableNamesTemplate = '<h3>Preview table: &nbsp <select id="tableNames"> ' +
        '<% _.each(tableNames, function(tableName) { %> <option value= <%= tableName.short %> ><%= tableName.long %></option> <% }); %>' +
        '</select> </h3>'

    var previewTemplate = '<table> <% _.each(previewRows, function(previewRow) { %> <tr> <% _.each(previewRow, function(previewCell) { %> <td><%= previewCell %></td> <% }); %></tr> <% }); %> </table';

    var template = '<div> <div id="tableNamesTemplate"></div> '
    //+'<button class="send"> Send </button> '
    + '<div id="previewTemplate"></div> </div>';

    
    /*

possibly get list of tables:
https://www.googleapis.com/drive/v2/files/0B2Yen0Dh1fQjUldJOFZvaWNNbWM/children

access google drive/ fusion table with:
https://www.googleapis.com/fusiontables/v1/query?sql=SELECT * FROM 1WZX7wwo6WfBpJ8k47B_GVz7gIngsEvsbNrp6qtR6 LIMIT 10&key=AIzaSyDpfNMH_IkouFwgI8y0_6tTQ0437Ncx8cQ


https://www.googleapis.com/fusiontables/v1/query?sql=select 'Geography - Codes' as location, 'Year - Labels' as time, 'RENT AND MORTGAGE PAYMENTS - Average monthly household mortgage payment ($)' as value from 1gB66u4yU-Jc7Q9m8oYtkr5VPf_f5gE0os4fTrMRa LIMIT 1000&key=AIzaSyDpfNMH_IkouFwgI8y0_6tTQ0437Ncx8cQ

*/
    
    //TODO don't hardcode this
    var driveTableNames = [
        {
            long: "National Regional Profile, Population, ASGS, 2007-2011",
            short: "1NZqM7xmjpXLlyBoryjnrOuiKw56FxuJ3tc_zGAVD"
        },
        {
            long: "National Regional Profile, Industry, ASGS, 2007-2011",
            short: "1DhCZ70s6Zb2sVwy3U7cAj01pkZ_PO8F1wS44iaeW"
        },
        {
            long: "National Regional Profile, Environment, ASGS, 2007-2011",
            short: "1WZX7wwo6WfBpJ8k47B_GVz7gIngsEvsbNrp6qtR6"
        },
        {
            long: "National Regional Profile, Economy, ASGS, 2007-2011",
            short: "1gB66u4yU-Jc7Q9m8oYtkr5VPf_f5gE0os4fTrMRa"
        }
]

    var API_KEY = "AIzaSyDpfNMH_IkouFwgI8y0_6tTQ0437Ncx8cQ"

    Iframework.NativeNodes["masher-pgsqlPreview"] = Iframework.NativeNodes["masher"].extend({

        info: {
            title: "pgsql preview",
            description: "postgresql (pgsql) table preview"
        },
        initializeModule: function () {
            // here comes the constructor
            this.$el.html(template);
            this.$el.find("#tableNamesTemplate").html(_.template(tableNamesTemplate, {
                tableNames: driveTableNames
            }));
            this.preview(driveTableNames[0].short, this.model.get('state')['databaseUrl']);

        },
        remove: function () {
            // here comes the desctructor
        },
        events: {
            "change #tableNames": function (e) {
                this.preview(e.target.value, this.model.get('state')['databaseUrl']);
            }
        },

        preview: function (tableName, url) {

            var node = this;

            d3.json(url + "select * from " + tableName + " limit 3" + "&key=" + API_KEY,
                function (error, table) {

                    if (error) return console.warn(error);

                    node.send("tableColumns", table.columns);

                    // add the column names as the first row
                    table.rows.unshift(table.columns);

                    node.$el.find("#previewTemplate").html(_.template(previewTemplate, {
                        previewRows: table.rows
                    }));
                });

        },

        inputdatabaseUrl: function (value) {
            this.preview(driveTableNames[0].short, value);
            // TODO: fetch table names and update
        },
        inputs: {
            databaseUrl: {
                type: "string",
                description: "url of postgresql database",
            },
        },
        outputs: {
            tableColumns: {
                type: "array",
                description: "column names of table currently being previewed"
            },
        }
    });

});
