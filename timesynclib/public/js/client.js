var socket;
var nextMessageExpected = 0;
var lastMessageTime = new Date().getTime();

var nextTick = 0;
var needsTick = false;
var timeOffset = 0;
var useCompensation = true;

function initSocket() {
	
	socket = io({transports : ["websocket"]});

	socket.on("connect", function() {
		document.getElementById("status").innerHTML = "Socket connected.";
		
		// send a random message to keep connection alive?
		setInterval(function() {
			socket.emit("ack");
		}, 100);

		nextMessageExpected = new Date().getTime() + 1000;
	});

	socket.on("tick", function(data) {
		
		socket.emit("ack", {t:new Date().getTime()});

		document.getElementById("time").innerHTML = "Tick: " + data.t;
		
		if(data.t % 2 == 0) {
			document.body.style.backgroundColor = 'blue';	
		} else {
			document.body.style.backgroundColor = 'white';
		}
	});

	socket.on("ping-pong", function(data) {
		console.log(counter);
		document.getElementById("status").innerHTML = "Ping: " + data;
		
		
		var timeSinceLastPing = new Date().getTime() - lastMessageTime;
		var drift = (timeSinceLastPing - 1000) / 2;
		timeOffset = data.ping;
		
		nextTick = new Date().getTime() + 500 - Math.floor(data.ping * 0.75);
		needsTick = true;

		document.getElementById("status").innerHTML = "drift: " + drift + ", ping: " + data.ping;

		lastMessageTime = new Date().getTime();
		
		if(!useCompensation){
		//	beat();
		}
		
		socket.emit("ping-pong", data);
	});
}


document.getElementById("status").innerHTML = "Initialized.";

var counter = 0;
function beat(){
	if(counter++ % 2 == 0) {
		document.body.style.backgroundColor = useCompensation ? 'green' : 'blue';
	} else {
		document.body.style.backgroundColor = 'white';
	}
	sound.getSound("tick").start(1);
}



function looper() {
	if(useCompensation) {
		if(needsTick && (new Date().getTime() - timeOffset) > nextTick){
			beat();
			//needsTick = false;
			nextTick = new Date().getTime() + 1000;
		}
	}
	requestAnimationFrame(looper);
}
//needsTick = true;
//nextTick = new Date().getTime() + 1000;
looper();

var soundStarted = false;
sound.initialize(function() {
	
	if ('ontouchstart' in window) {
		document.getElementById("status").innerHTML = "Touch to start...";
		document.body.addEventListener("touchstart", function(e) {
			//document.body.style.backgroundColor = 'blue';
			if(soundStarted){
				useCompensation = !useCompensation;
			}
			else {
				soundStarted = true;
				sound.getSound("tick").start(1);
				
				setTimeout(function(){
					initSocket();
				}, 200);	
			}
		});
	} else {
		initSocket();
	}
});