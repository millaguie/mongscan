
var net = require('net');
var cidr = require('ipfunctions/lib/cidr.js');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('mongoscan.sqlite',"OPEN_CREATE");


// MongoDB ports 27017 to 27019
// IP address space in long format: 1 to 4294967294

function nextIP()
{
    return cidr.long2ip(Math.floor(Math.random()*(4294967294)+1));
}

IP = nextIP();
console.log(IP);

function checkPort (port,host){
  var socket = net.connect(port,host);
  socket.setTimeout(2);
  socket.on ('connect',function(){
    console.log (host+":"+port+"is open" );
    socket.end();
  });
  socket.on('error',function(err){
    console.log(host+":"+port+"is closed" );
    socket.destroy();
  })
}

for (port = 27017; port<= 27019;port++){
  checkPort(port,IP);
}

