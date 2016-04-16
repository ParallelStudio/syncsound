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
	slaveSockets.forEach(socket => {
		socket.emit('slaveCt', { slaves: slaveCt });
	});
	if(masterSocket){
		masterSocket.emit('slaveCt', { slaves: slaveCt });
	}
}

function dispatchPlay(){
	let num = 0;
	slaveSockets.forEach(socket => {
		setTimeout(function(){
			socket.emit('play', {num: num});
		}, num * 1000);
		num++;
	});
	// slaveSockets.forEach(socket => {
	// 	socket.emit('play', {});
	// });
}

io.on('connection', function (socket) {

	socket.emit('whoareyou', { message: 'whoareyou' });

	socket.on('disconnect', function(msg){
		console.log('disconnect ' + msg);
		//TODO: Remove slave from array
		slaveCt--;
		dispatchSlaveCt();
	});
	
	socket.on('slave', function (data) {

		slaveSockets.push(socket);
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
