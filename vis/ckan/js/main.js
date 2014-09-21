
// d3.json("http://stats.oecd.org/OECDStatWCF_OData/OData.svc/GetDatasets?LanguageCode='en'&$format=json", 
d3.json("/ckan/data/oecd.en.json", 
	function(datasets){

		d3.select(".left")
		 .selectAll('div')
		 .data(datasets.value)
		 .enter()
		 .append('div')
		 .html(function(d){ return d.DatasetTitle+" - "+d.DatasetCode; })
		 .on('click', function(d){
		 	d3.select(".upper").html(d.DatasetMetadata);
			// d3.json("http://stats.oecd.org/OECDStatWCF_OData/OData.svc/GetDimension?DatasetCode=" + d.DatasetCode + "&$format=json",
			$('.lower').html('<h3>loading...</h3>')
			d3.json("http://stats.oecd.org/OECDStatWCF_OData/OData.svc/"+ d.DatasetCode +"?$format=json",
			 	 function(dimensions){
		            var data = dimensions.value;
		            try{ data = JSON.parse(json); }
		            catch(e){ 
		                console.log('not valid JSON');
		            }
		            var node = new PrettyJSON.view.Node({ 
		                el:$('.lower'),
		                data: data,
		                dateFormat:"DD/MM/YYYY - HH24:MI:SS"
		            });

		            if (! _.isEmpty(node.childs)) node.childs[0].show();

			 	 	// console.log(dimensions);
			 	 	// d3.select(".lower").html(dimensions.value)
		 	});
		 });
});

// all datasets
// http://stats.oecd.org/OECDStatWCF_OData/OData.svc/GetDatasets?LanguageCode='en'&$format=json

// http://stats.oecd.org/OECDStatWCF_OData/OData.svc/GetDimension?DatasetCode='REFSERIES&$format=json'




// d3.json("/ckan/data/oecd.en.json", 
// 	function(datasets){


//       var el = {
//             btnAction: $('#action'),
//             btnClear: $('#clear'),
//             input: $('#input'),
//             result: $('#result')
//         };

//         var demo = datasets.value;
//         // {
//         //     name:'John Doe',
//         //     age: 20,
//         //     children:[{name:'Jack', age:5}, {name:'Ann', age:8}],
//         //     wife:{name:'Jane Doe', age:28 }
//         // };

//         el.input.val(JSON.stringify(demo,null,4));

//         el.btnAction.on('click', function(){
//             var json = el.input.val();

//             var data;
//             try{ data = JSON.parse(json); }
//             catch(e){ 
//                 alert('not valid JSON');
//                 return;
//             }

//             var node = new PrettyJSON.view.Node({ 
//                 el:el.result,
//                 data: data,
//                 dateFormat:"DD/MM/YYYY - HH24:MI:SS"
//             });
//         });

//         el.btnClear.on('click', function(){
//             el.input.val('');
//             el.result.html('');
//         });




// });


    