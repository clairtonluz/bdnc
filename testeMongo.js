var mongoose = require('mongoose');
var Rota = require('./models/Rota');
var fs = require('fs');

var rotasJson = JSON.parse(fs.readFileSync('rotasToTeste.json', 'utf8'));

mongoose.connect('mongodb://localhost/bdnc');

var Rota = Rota();;

var startTests = _startTests;
var testeInserts = _testeInserts;
var testeUpdates = _testeUpdates;
var _testeDeletes = _testeDeletes;

startTests();

total = 100;
console.log(total);
totalProcessado = 0;



// console.time("queries duration");
// console.log('aa');
// Rota.find({}, '_id', function(err, docs){
// 	console.log('aasss');
// 	console.timeEnd("queries duration");
// 	// console.log(docs);
// 	_sair();
// });

function _sair(){
	console.log("Finish");
	process.exit();
}

function _startTests(){
	_testeInserts(rotasJson, function (rotas) {
		_testeUpdates(rotas, function(){
			_testeDeletes(rotas, function(){
				_sair();
			});
		});
	})
}

function _testeInserts(rotas, done){
	console.time("inserts duration");
	var docs = [];
	_save(0);

	function _save(position){
		Rota.create(rotas[position], function(err, doc){
			totalProcessado++;
			docs.push(doc);
			// console.log(totalProcessado +'-'+total);
			if(totalProcessado < total){
				var position = totalProcessado % rotas.length;
				_save(position);
			} else {
				console.timeEnd("inserts duration");
				done(docs);
			}
		});
	}
}

function _testeUpdates(rotas, done){
	console.time("updates duration");
	_update(0);
	function _update(position){
		if(position < rotas.length){	
			var rota = rotas[position];
			Rota.update({_id: rota['_id']}, {$set: {destination: 'Quixadá = CE'}}, function(err, doc) {
				_update(++position);
			});
		} else {
			console.timeEnd("updates duration");
			done();
		}
	}
}


function _testeDeletes(rotas, done){
	console.time("deletes duration");
	_remove(0);

	function _remove(position){
		if(position < rotas.length){
			Rota.remove({_id: rotas[position]['_id']}, function(err){
				_remove(++position);	
			});	
		} else {
			console.timeEnd("deletes duration");
			done();
		}
	}
}