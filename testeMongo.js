var mongoose = require('mongoose');
var Rota = require('./models/Rota');
var fs = require('fs');

mongoose.connect('mongodb://localhost/bdnc');

var Rota = Rota();;
var total = 100;
console.log(total);

var startTests = _startTests;
var testeInserts = _testeInserts;
var testeUpdates = _testeUpdates;
var testeDeletes = _testeDeletes;
var sair = _sair;

startTests();


function _startTests(){
	Rota.remove({}, function(err){
		testeInserts(function () {
			testeUpdates(function(){
				testeDeletes(function(){
					sair();
				});
			});
		})
	});
}

function _testeInserts(done){
	let rotas = JSON.parse(fs.readFileSync('rotasToTeste.json', 'utf8'));
	let totalProcessado = 0;
	console.time("inserts duration");
	_save(0);

	function _save(position){
		let rota = rotas[position]
		rota['_id'] = totalProcessado + 1;
		Rota.create(rota, function(err, doc){
			if(err) console.log(err.message);
			totalProcessado++;
			// fs.appendFile(filename, doc['_id'] + '\n', 'utf8');
			// console.log(totalProcessado +'-'+total);
			if(totalProcessado < total){
				var position = totalProcessado % rotas.length;
				_save(position);
			} else {
				console.timeEnd("inserts duration");
				done();
			}
		});
	}
}

function _testeUpdates(done){
	let totalProcessado = 0;
	console.time("updates duration");

	let id = totalProcessado + 1;

	_update(id);
	function _update(id){
		Rota.update({_id: id}, {$set: {destination: 'Quixadá = CE'}}, function(err, doc) {
			if(err) console.log(err.message);
			totalProcessado++;
			if(totalProcessado < total){
				id = totalProcessado + 1;
				_update(id);
			} else {
				console.timeEnd("updates duration");
				done();
			}
		});

	}
}


function _testeDeletes(done){
	let totalProcessado = 0;
	console.time("deletes duration");

	let id = totalProcessado + 1;

	_remove(id);
	function _remove(id){
		Rota.remove({_id: id}, function(err){
			if(err) console.log(err.message);
			totalProcessado++;
			if(totalProcessado < total){
				id = totalProcessado + 1;
				_remove(id);
			} else {
				console.timeEnd("deletes duration");
				done();
			}
		});	
	}
}

function _sair(){
	console.log("Finish");
	process.exit();
}