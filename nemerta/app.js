'use strict';
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var PORT = 8080;

app.use(express.static('static'));
app.set('views', __dirname + '/views')
app.set('view engine', 'jade');

server.listen(PORT);
console.log(`Listening on ${PORT}`);

app.get('/', function (req, res) {
	res.render('slave', {});
});

app.get('/m', function(req, res) {
	res.render('master', {});
});

var slaveCt = 0;
var masterSocket = null;
var slaveSockets = [];

function dispatchSlaveCt(){
	slaveSockets.forEach(slave => {
		slave.socket.emit('slaveCt', { slaves: slaveCt });
	});
	if(masterSocket){
		masterSocket.emit('slaveCt', { slaves: slaveCt });
	}
}

function dispatchPlay(){
	slaveSockets.forEach(slave => {
		setTimeout(function(){
			console.log("Playing " + slave.num);
			slave.socket.emit('play', {num: slave.num});
		}, slave.num * 1000);
	});
}

function removeSlave(socket){
	//Remove slave from array
	var index = -1;
	for(var i = 0; i < slaveSockets.length; i++){
		if(slaveSockets[i].socket == socket){
			index = i;
		}
	}
	console.log("Removing client at index " + index);
	slaveSockets.splice(index, 1);
	slaveCt--;
}

io.on('connection', function (socket) {

	socket.emit('whoareyou', { message: 'whoareyou' });

	socket.on('disconnect', function(msg){
		console.log('disconnect ' + msg);
		removeSlave(socket);
		dispatchSlaveCt();
	});

	socket.on('slave', function (data) {

		slaveSockets.push({ socket: socket, num: slaveSockets.length+1 });
		socket.emit('youare', { iam: slaveSockets.length});

		slaveCt++;
		dispatchSlaveCt();
		console.log('slave connected');
	});
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
