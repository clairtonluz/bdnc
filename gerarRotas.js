var https = require('https');
var polyline = require('polyline');
var fs = require('fs');

var cidades = JSON.parse(fs.readFileSync('cidades.json', 'utf8'));

var urls = [];
var rotas = [];


var getRota = _getRota;
var addRota = _addRota;
var writeFile = _writeFile;
var teste = _teste;

teste();

for(i = 0; i < cidades.length; i++){
	let city1 = cidades[i];
	for(j = 0; j < cidades.length; j++){
		let city2 = cidades[j];

		if(city1.localeCompare(city2) != 0) {
				// console.log(city1 + " to " + city2 + " = " + city1.localeCompare(city2));
			let url = 'https://maps.googleapis.com/maps/api/directions/json?origin='+city1+'&destination='+city2+'&key=AIzaSyCdr6YVfup0zMWf1P_Zqva_09oWoq99Gl8';
			
			var rota = {origin: city1, destination: city2, url: url};

			urls.push(rota);
		}
	}
}

var count2 = 0;
function _teste(){
	setTimeout(function (argument) {
		let x = urls[count2++];
		// console.log(x);
		getRota(x);
		if(count2 < urls.length){
			_teste();
		}
	}, 1);

}
console.log(urls.length)

// for(i = 0; i < 10; i++){
// 	getRota(url);
// }
total = 0;
totalExecutado = 0;
function _getRota(rota) {
	total++;
	https.get(rota.url, (res) => {
		totalExecutado++;
		if(res.statusCode == 200){

	  		let body = '';

			res.on('data', (d) => {
				body += d;
			});

			res.on('end', function(){
		        let json = JSON.parse(body);
		        try{

					let points = json.routes[0].overview_polyline.points;
					rota.route = { type: "LineString", coordinates: polyline.decode(points) }
		        	addRota(rota);

		        } catch(err){
		        	// console.log(err.message);
		        	// console.log(rota.url);
		        }
	    	});

		} else {
			// console.log(rota.url);
		}


	}).on('error', (e) => {
	  console.error(e);
	});
}

function _addRota(rota) {
	delete rota.url;
	rotas.push(rota);

	// if(total == totalExecutado && totalExecutado != 0){
	// 	console.log("Gravar");
		writeFile("rotas.json", JSON.stringify(rota)+',\n');
	// }
}

function _writeFile(filename, data) {
	fs.appendFile(filename, data, 'utf8', (err) => {
	  if (err) throw err;
	  console.log('The "data to append" was appended to file!');
	});
}


