var mongoose = require('mongoose');
var Rota = require('./models/Rota');
var fs = require('fs');

var cidades = JSON.parse(fs.readFileSync('cidades.json', 'utf8'));

mongoose.connect('mongodb://localhost/bdnc');

var Rota = Rota();;

var limit = 10;
var size = cidades.length -1;

total = limit * size * size;
console.log(total);
totalProcessado = 0;

console.time("duration");

for(x = 0; x < limit; x++){

	for(i = 0; i < cidades.length; i++){
		let city1 = cidades[i];
		for(j = 0; j < cidades.length; j++){
			let city2 = cidades[j];
			if(city1.localeCompare(city2) != 0) {

				var viagem = new Rota({ origin: city1, destination: city2, route: '2213123123123' });
				_save(viagem);
			}
		}
	}
	
}

function _save(viagem){
	viagem.save().then(function(doc){
		totalProcessado++;
		// console.log(totalProcessado +'-'+total);
		if(totalProcessado == total){
			console.timeEnd("duration");
			console.log("Complete");
			process.exit();
		}
	});
}