
var audio = new Audio();

function pageLoaded(){

	if (!hasTouch()) {
		$('#throbber-loaded').show();
		$('#fingerprint').hide();
	}

	loadAudio();
}

function loadAudio(){
	$('#top').text('loading');
	var isIos = /(ipod|iphone|ipad)/.test(navigator.userAgent.toLowerCase());
	var audiopreloadevent = isIos ? "progress" : "loadeddata";
	$(audio).on(audiopreloadevent, audioLoaded);
	audio.src = '/count10.mp3';
}

function audioLoaded(){

	$('#top').text('loaded');
	if(hasTouch()){
		$('#top').text('touch me');
		$('#fingerprint').on('touchstart', function () {
			$('#top').text('connecting');
		    $('#fingerprint').hide();
		    $('#throbber-loaded').show();
		    audio.play();
		    audio.pause();
		    setupSocket();
		});	
	}
	else {
		setupSocket();
	}	
}

function setupSocket(){
	console.log("LOADED audio");
	console.log("Connecting websocket...");
	var socket = io.connect('/');
	socket.on('connect', function(){
		console.log("Websocket connected.");
	});
	socket.on('slaveCt', function(data){
		console.log('slaveCt ' + data.slaves);
		$('#slaveCt').text('clients: ' + data.slaves);
	});
	socket.on('whoareyou', function(data){
		console.log("Server said: " + data.message);
		socket.emit('slave', {});
		$('#top').text('waiting');
	});

	socket.on('play', function(data){
		console.log("Server wants me to play...");
		$('#top').text('playing');

		var delay = 0;
		if(!hasTouch()){
			delay = 200;
		}
		setTimeout(function(){ 
			audio.play();
		}, delay);

		$(audio).on('ended', function(){
			$('#top').text('waiting');
		});
	});
}

function hasTouch(){
	return 'ontouchstart' in document.documentElement;
}