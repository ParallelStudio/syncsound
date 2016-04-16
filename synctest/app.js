var express   = require('express');
var app       = express();
var server    = require("http").createServer(app);
var port      = 8080;

var io = require('socket.io')(server);
io.set("transports", ["websocket"]);

var clients   = [];

io.sockets.on('connection', function (socket) {

  clients.push( { "socket": socket } );

  socket.on("disconnect", function() {
    for(var i = 0; i < clients.length; i++){
      if(clients[i].socket === socket){
        clients.splice(i, 1);
        break;
      }
    }
    console.log("Client disconnected, clients: " + clients.length);
  });

  console.log("Client connected, clients: " + clients.length);

  socket.on('master', function(data){
		console.log('We got ourselves a master here');
		masterSocket = socket;
		masterSocket.emit('slaveCt', { slaves: slaveCt });
		socket.on('disconnect', function(){
			console.log('Master disconnected.');
			masterSocket = null;
		});
		socket.on('play', function(){
			console.log("Dispatching play to slaves...");
			dispatchPlay();
		});
	});

});

var t = 0;
setInterval(function() {
  t++;
  for(var i = 0; i < clients.length; i++){
    clients[i].socket.emit("tick", {t:t,
      time: new Date().getTime(),
      color: t % 2 == 0 ? 'cyan' : 'pink'
    });
  }
}, 1000);

app.use(express.static('./public'));

server.listen(port);

console.log("\n-----------------------------");
console.log("Server listening on port " + port);
console.log("-----------------------------\n");
