const Aerospike = require('aerospike');
const GeoJSON = Aerospike.GeoJSON;
var fs = require('fs'),
    readline = require("readline");



var baseData = [];
var NUM_OPERATIONS = 1000000;
//var NUM_OPERATIONS = 1000;



var client = Aerospike.client({
    hosts: [
        { addr: "127.0.0.1", port: 3000 }
    ],
    log: {
        level: Aerospike.log.INFO
    },
    policies: {
        timeout: 30000
    },
    maxConnsPerNode: 1000
})



var rd = readline.createInterface({
      input: fs.createReadStream('rotasToTeste.json'),
      output: process.stdout,
      terminal: false
  });

  rd.on('line', function(line) {
    line = line.trim();
    if( line.charAt(0) == "[" ){
      line = line.substr( 1 , line.length  );
    }
    if(line.charAt( line.length - 1 ) == ","){
      line = line.substr( 0 , line.length - 1 );
    }
    try{
      var reg = JSON.parse( line ) ;
      reg.route =  new GeoJSON( reg.route );
      baseData.push( reg );    
    }catch(e){}
  });

  //Ao terminar de ler o arquivo começa os testes
  rd.on("close" , function(){

    client.connect(function (error) {
      testInserts()
      .then(testUpdate)
      .then(testDelete)
    .then(
      function(){
        //finaliza o pool de conecoes
        client.close();
      });
    });
    
  });





function testInserts( ){
  return new Promise( function(resolve , reject ){
      console.time("insert");
      var current =1;
      for( var i = 1 ; i < NUM_OPERATIONS ; i++ ){
          var key = new Aerospike.Key('test', 'demo', i)
          var rec = baseData[Math.floor( Math.random() * 300 )];

          client.put(key, rec, function (error) { 
            current++;
            if(current == NUM_OPERATIONS) {
              console.timeEnd("insert");
              resolve( null );
            }
          });
      }
  });
}

function testUpdate(){
  return new Promise( function(resolve , reject ){
      console.time("update");
      var current =1;
      for( var i = 1 ; i < NUM_OPERATIONS ; i++ ){
        var key = new Aerospike.Key('test', 'demo', i)
          var rec = baseData[Math.floor( Math.random() * 300 )];

          client.put(key, rec, function (error) { 
            current++;
            if(current == NUM_OPERATIONS) {
              console.timeEnd("update");
              resolve( null );
            }
          });
      }
  });
}

function testDelete(){
  return new Promise( function(resolve , reject ){
      console.time("delete");
      var current = 1;
      var sql = "DELETE FROM bdnc.route WHERE id = $1";
      for( var i = 1 ; i < NUM_OPERATIONS ; i++ ){

            var key = new Aerospike.Key('test', 'demo', i)
            client.remove(key, function (error, key) {
              current++;
              if(current == NUM_OPERATIONS) {
                console.timeEnd("delete");
                resolve( null );
              }
            });
      }
  });
}
