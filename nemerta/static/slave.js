
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

	for(var i=0; i < 10; i++){
		var x = function(num){
			return function(){
				return loadAudio(num);
			}
		}
		setTimeout(x(i), 100 * i);
		// loadAudio(i);
	}
}

function loadAudio(num){
	console.log("Loading audio " + num);
	$('#top').text('loading ' + num );
	var isIos = /(ipod|iphone|ipad)/.test(navigator.userAgent.toLowerCase());
	var audiopreloadevent = isIos ? "progress" : "loadeddata";
	$(audios[num]).on(audiopreloadevent, audioLoaded(num));
	audios[num].src = '/counts/long/' + (num+1) + '.mp3';
}

var numLoaded = 0;
function audioLoaded(num){
	return function(){
		$('#top').text('done ' + num);

		numLoaded++;
		if(numLoaded != 10){
			return;
		}
		$('#top').text('loaded ' + num);
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
		$('#top').text('OMFG ' + data.num);
		console.log("Server wants me to play...");
		// $('#top').text(JSON.stringify(data));
		doPlay(data.num);
	});
}

function doPlay(num){
	$('#top').text('playing ' + num);
	var delay = 0;
	if(!hasTouch()){
		delay = 200;
	}
	setTimeout(function(){
		audios[num-1].play();
	}, delay);

	$(audios[num-1]).on('ended', function(){
		$('#top').text('waiting');
	});
}

function hasTouch(){
	return 'ontouchstart' in document.documentElement;
}
