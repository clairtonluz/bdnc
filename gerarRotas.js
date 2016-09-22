var https = require('https');
var polyline = require('polyline');

var url = 'https://maps.googleapis.com/maps/api/directions/json?origin=Boston,MA&destination=Concord,MA&key=AIzaSyCdr6YVfup0zMWf1P_Zqva_09oWoq99Gl8';
var rotas = [];

var getRota = _getRota;
var addRota = _addRota;


for(i = 0; i < 10; i++){
	getRota(url);
}


function _getRota(url_rota) {
	https.get(url_rota, (res) => {

		var body = '';

		res.on('data', (d) => {
			body += d;
		});

		res.on('end', function(){
	        var json = JSON.parse(body);
	        let points = json.routes[0].overview_polyline.points;
	        addRota(polyline.decode(points));
	    });

	}).on('error', (e) => {
	  console.error(e);
	});
}

function _addRota(rota) {
	rotas.push(rota);
	console.log(rotas);
}
