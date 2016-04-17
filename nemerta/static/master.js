
function pageLoaded(){

	$('#top').text('connecting');
	console.log("LOADED audio");
	console.log("Connecting websocket...");
	// var socket = io.connect('http://192.168.66.4:8080');	//TODO: Don't hard code me
	var socket = io.connect('/');
	socket.on('connect', function(){
		console.log("Websocket connected.");
	});
	socket.on('slaveCt', function(data){
		console.log('slaveCt ' + data.slaves);
		$('#slaveCt').text('clients: ' + data.slaves);
	});

	$('#start').on('click', function(){
		console.log("start clicked");
		socket.emit('play', {});
	});

	socket.on('whoareyou', function(data){
		console.log("Server said: " + data.message);
		socket.emit('master', {});
		$('#top').text('ready');
	});
}
