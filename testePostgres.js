var pg = require("pg"),
    fs = require('fs'),
    readline = require("readline");


var conString = "postgres://postgres:@localhost:5432/postgres";

var client = new pg.Client(conString);


// create a config to configure both pooling behavior
// and client options
// note: all config is optional and the environment variables
// will be read if the config is not present
var config = {
  user: 'postgres', //env var: PGUSER
  database: 'postgres', //env var: PGDATABASE
  password: '', //env var: PGPASSWORD
  host: 'localhost', // Server hosting the postgres database
  port: 5432, //env var: PGPORT
  max: 30, // max number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};

var pool = new pg.Pool(config);


var baseData = [];
var NUM_OPERATIONS = 1000000;

client.connect( function(err){
  if(err) throw err;

  _checkSchema(client);


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
      var r = JSON.parse( line );
      var cords = r.route.coordinates;
      var lineString = "LINESTRING("
      for( var i = 0 ; i < cords.length ; i++ ){
        var cord = cords[i];
         lineString += cord[0] + " " + cord[1];
         if( i +1 < cords.length )
           lineString+= ",";
      }
      lineString += ")";
      r.route = lineString;
      baseData.push( [ r.origin  , r.destination , r.route ] );    
    }catch(e){}
  });

  //Ao terminar de ler o arquivo começa os testes
  rd.on("close" , function(){
    testInserts()
    .then(testUpdate)
    .then(testDelete).then(
      function(){
        //finaliza o pool de conecoes
        pool.end();
      });
  });
  //insert: 3089491.250ms
  //update: 3430558.115ms
  //delete: 4355029.487ms

});

function testInserts( ){
  return new Promise( function(resolve , reject ){
      console.time("insert");
      var current =1;
      for( var i = 1 ; i < NUM_OPERATIONS ; i++ ){
          pool.connect(function(err, client, done) {
            var d = baseData[Math.floor( Math.random() * 300 )];
            client.query('INSERT INTO bdnc.route( origin , destination , route ) '
                + 'VALUES ( $1 , $2 , ST_GeomFromText($3, 3857) )' , [d[0] , d[1] , d[2]] ,
                function(err){ 
                 if(err) console.log(err); 
                 current++;
                 done();
                 if(current == NUM_OPERATIONS) {
                   console.timeEnd("insert");
                   resolve( null );
                 }
            } ); 
          });
      }
  });
}

function testUpdate(){
  return new Promise( function(resolve , reject ){
      console.time("update");
      var current =1;
      var sql = "UPDATE bdnc.route SET origin = $1 , destination = $2 "+
            ", route = ST_GeomFromText($3, 3857) WHERE id = $4";
      for( var i = 1 ; i < NUM_OPERATIONS ; i++ ){
          (function(id){
            pool.connect(function(err, client, done) {
              var d = baseData[Math.floor( Math.random() * 300 )];
              client.query(sql , [d[0] , d[1] , d[2] , id ] ,
                  function(err){ 
                   if(err) console.log(err); 
                   current++;
                   done();
                   if(current == NUM_OPERATIONS) {
                     console.timeEnd("update");
                     resolve( null );
                   }
              } ); 
            });
          })(i);
      }
  });
}

function testDelete(){
  return new Promise( function(resolve , reject ){
      console.time("delete");
      var current = 1;
      var sql = "DELETE FROM bdnc.route WHERE id = $1";
      for( var i = 1 ; i < NUM_OPERATIONS ; i++ ){
          (function(id){
            pool.connect(function(err, client, done) {
                        client.query(sql , [ id ] ,
                            function(err){ 
                             if(err) console.log(err); 
                             current++;
                             done();
                             if(current == NUM_OPERATIONS) {
                               console.timeEnd("delete");
                               resolve( null );
                             }
                        } ); 
                      });
          })(i);
      }
  });
}


function _checkSchema(client){

  client.query('SELECT EXISTS(SELECT 1 FROM information_schema.schemata '+
   ' WHERE schema_name = $1 )' , ['bdnc'], function(err , result ){
       // var exists = result.rows[0].exists;
       client.query(" CREATE SCHEMA bdnc", function(err){
          client.query("create extension postgis", function(err){
            //ignore if the extension already exists
            client.query(
                "DROP TABLE IF EXISTS bdnc.route" 
              , function(err){
                client.query(
                    "CREATE TABLE bdnc.route( id bigserial primary key ,  origin text "
                    +" , destination text , route geometry(LINESTRING,3857) )" 
                  , function(err){
                    //ignore if table exits

                      client.end(function(err){
                        if(err) throw err;       
                      });
                    } 
                );
              });
          });
       } );
  });
  ;

}