
var async = require('async');
var net = require('net');
var cidr = require('ipfunctions/lib/cidr.js');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('mongoscan.sqlite');



// MongoDB ports 27017 to 27019
// IP address space in long format: 1 to 4294967294

function nextIP()
{
    return cidr.long2ip(Math.floor(Math.random()*(4294967294)+1));
}
db.run("CREATE TABLE IF NOT EXISTS IP (ip LONG, port INT, status INT, banner TEXT, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
//db.run("CREATE TABLE IF NOT EXISTS IP (ip LONG, port INT, status INT, banner TEXT, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, primary key (ip,port) )");
//db.run("CREATE TABLE IF NOT EXISTS IP_historic (ip LONG, port INT, status INT, banner TEXT, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, primary key (ip,port,date) )");


/*function checkPort(port,host){ // first we have to check if we already have this in the database, this is blocking...
  iplong=cidr.ip2long(host)
  db.get("SELECT * FROM IP where ip="+iplong+" and port="+port, function(err, row) {
    if (row!='undefined'){
      db.run("INSERT INTO IP_historic SELECT * FROM IP where ip="+iplong+" and port="+port);
      db.run("DELETE FROM IP where ip="+iplong+" and port="+port);
      console.log("Moving to historic: "+host+":"+port);
    }
    checkPortPart2(port,host);
  });
  
}*/
function checkPort (port,host){
  console.log("Working on:"+host+":"+port);
  iplong=cidr.ip2long(host)
  var socket = net.connect(port,host);
  socket.setTimeout(4000,function(){
    console.log(host+":"+port+"timed out");
    query="INSERT into IP (ip, port, status) values ("+iplong+","+port+",2)";
//    console.log(query);
    db.run(query); // 2 is for timeout
    socket.destroy();
  });
  socket.on ('connect',function(){
    console.log (host+":"+port+"is open lets" );
    query="INSERT into IP (ip, port, status) values ("+iplong+","+port+",0)";
//    console.log(query);
    db.run(query); // 0 is for open
    socket.end();
  });
  socket.on('error',function(error){
    console.log(host+":"+port+"is closed"+error );
    query="INSERT into IP (ip, port, status, banner) values ("+iplong+","+port+",1,\'"+error+"\')";
//    console.log(query);
    db.run(query); // 1 is for other
    socket.destroy();
  })
}


var q = async.queue(function (IP,next){
  
  checkPort(80,IP);
  for (port = 27017; port<= 27019;port++){
    checkPort(port,IP);
  }
  next();
},2);


/*for (a=0;a<10;a++){ 
  IP=nextIP();
  console.log("Queueing "+IP);
  q.push(IP);
}*/

q.push("127.0.0.1");
setInterval(function() {
  if (q.length()< 4){
    IP=nextIP();
    console.log("Queueing "+IP);
    q.push(IP);
  }
  else{
    console.log("No more IPS this time");
  }
}, 1000);


//db.close();