
var async = require('async');
var net = require('net');
var cidr = require('ipfunctions/lib/cidr.js');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('mongoscan.sqlite');
MAXCON=50;  // Max paralell connections trying (aprox.)
QREFILL=100; // millisecond between queue fill attemp 
global.verbose=false;

global.OC=0; // This global var is used to kwnow the number of connections
global.TOTAL=0; //lets track how many hosts we have test on this run.
// MongoDB ports 27017 to 27019
// IP address space in long format: 1 to 4294967294

function nextIP()
{
    return cidr.long2ip(Math.floor(Math.random()*(4294967294)+1));
}


function checkPort (port,host,next){
  global.OC++;
  global.TOTAL++;
  iplong=cidr.ip2long(host)
  var socket = net.connect(port,host);
  socket.setTimeout(10000,function(){
    if (verbose ) console.log(host+":"+port+" timed out");
    query="INSERT into IP (ip, port, status) values ("+iplong+","+port+",2)";
    db.run(query); // 2 is for timeout
    socket.destroy();
    global.OC--;
  });
  socket.on ('connect',function(){
    if (verbose )  console.log (host+":"+port+" is open lets" );
    query="INSERT into IP (ip, port, status) values ("+iplong+","+port+",0)";
//    console.log(query);
    db.run(query); // 0 is for open
    socket.end();
    global.OC--;

  });
  socket.on('error',function(error){
    if (verbose ) console.log(host+":"+port+"is closed "+error );
    query="INSERT into IP (ip, port, status, banner) values ("+iplong+","+port+",1,\'"+error+"\')";
    db.run(query); // 1 is for other
    socket.destroy();
    global.OC--;

  });
}
if (! verbose ) console.log("Let's go.");

// Initialize DATABASE if it's not. Don't expect this to run on the first try ;)
db.run("CREATE TABLE IF NOT EXISTS IP (ip LONG, port INT, status INT, banner TEXT, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");

var q = async.queue(function (IP,next){
  checkPort(80,IP,next());
  for (port = 27017; port<= 27019;port++){
    checkPort(port,IP);
  }
  //next();
},10);

var mainloop = setInterval(function() {
  if (verbose ) console.log("Connections: "+global.OC);
//  if (q.length() <20 ){
  if (global.OC<MAXCON){
    IP=nextIP();
  if (verbose )   console.log("Queueing "+IP);
    q.push(IP);
  }
  else{
    if (verbose ) console.log("No more IPS this time");
  }
}, QREFILL);

process.on('SIGINT', function() {
    console.log("Caught interrupt signal, please wait...");
    console.log(global.TOTAL + global.OC +"Hosts scanned in this run.");
    clearInterval(mainloop);


});

//db.close();