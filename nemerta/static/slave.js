
// var audio = new Audio();
var audios = [];

function pageLoaded(){

	for(i=0; i < 10; i++){
		audios.push( new Audio());
	}

	if (!hasTouch()) {
		$('#throbber-loaded').show();
		$('#fingerprint').hide();
	}

	for(i=0; i < 10; i++){
		loadAudio(i);
	}
}

function loadAudio(num){
	console.log("Loading audio " + num);
	$('#top').text('loading');
	var isIos = /(ipod|iphone|ipad)/.test(navigator.userAgent.toLowerCase());
	var audiopreloadevent = isIos ? "progress" : "loadeddata";
	$(audios[num]).on(audiopreloadevent, function(){
		audioLoaded(num);
	});
	audios[num].src = '/counts/long/' + (num+1) + '.mp3';
}

var numLoaded = 0;
function audioLoaded(num){
	numLoaded++;
	if(numLoaded != 10){
		return;
	}
	$('#top').text('loaded');
	if(hasTouch()){
		$('#top').text('touch me');
		$('#fingerprint').on('touchstart', function () {
			$('#top').text('connecting');
		    $('#fingerprint').hide();
		    $('#throbber-loaded').show();
		    audios[num].play();
		    audios[num].pause();
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
	socket.on('youare', function(data){
		console.log('iam ' + data.iam);
		$('#iam').text('ID: ' + data.iam);
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
			audios[data.num].play();
		}, delay);

		$(audio).on('ended', function(){
			$('#top').text('waiting');
		});
	});
}

function hasTouch(){
	return 'ontouchstart' in document.documentElement;
}
