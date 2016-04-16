var socket;

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
		
		socket.emit("ack", {t:new Date().getTime()});

		document.getElementById("time").innerHTML = "Tick: " + data.t;
		
		if(data.t % 2 == 0) {
			document.body.style.backgroundColor = 'blue';	
		} else {
			document.body.style.backgroundColor = 'white';
		}

		sound.getSound("tick").start(1);

		
	});
}


document.getElementById("status").innerHTML = "Initialized.";

sound.initialize(function() {
	
	if ('ontouchstart' in window) {
		document.getElementById("status").innerHTML = "Touch to start...";
		document.body.addEventListener("touchstart", function(e) {
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