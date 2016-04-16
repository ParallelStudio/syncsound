var socket;

var CLIENT_TIMER_MS = 50;
var timer = setInterval(tickHandler, CLIENT_TIMER_MS);
var bestDelta = 10000000;
var lastMessage;
var tick = 0;

function tickHandler(){
	++tick;
	document.getElementById("time").innerHTML = "sync tick " + lastMessage.t +
		" :: tick " + tick + " :: best delta " + bestDelta;
		document.body.style.backgroundColor = lastMessage.color;
}

function doTickAction(){
	if(lastMessage.t % 2 == 0){
		document.body.style.backgroundColor = 'pink';
	}
	else {
		document.body.style.backgroundColor = 'cyan';
	}
	sound.getSound("tick").start(1);
}

function initSocket() {

	socket = io({transports : ["websocket"]});

	socket.on("connect", function() {
		document.getElementById("status").innerHTML = "Socket connected.";

		// send a random message to keep connection alive?
		setInterval(function() {
			socket.emit("ack");
		}, 100);
	});

	socket.on("tick", function(data) {
		lastMessage = data;
		var now = new Date().getTime();
		socket.emit("ack", { t: now });
		// console.log(JSON.stringify(data));
		var delta = now - data.time;
		if(delta < bestDelta){
			console.log("NEW BEST " + delta);
			bestDelta = delta;
			clearInterval(timer);
			timer = setInterval(tickHandler, CLIENT_TIMER_MS);
		}
	});
};

document.getElementById("status").innerHTML = "Initialized.";

var started = false;
sound.initialize(function() {

	if ('ontouchstart' in window) {
		document.getElementById("status").innerHTML = "Touch to start...";
		document.body.addEventListener("touchstart", function(e) {
			if(started) return;
			started = true;
			document.body.style.backgroundColor = 'blue';

			sound.getSound("tick").start(1);

			setTimeout(function(){
				initSocket();
			}, 200);
		});
	} else {
		initSocket();
	}
});
