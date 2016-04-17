'use strict';

//
// serve index.html & primus.js
//
var server = require('http').createServer(function incoming(req, res) {
	
	if(req.url.match(/primus\/primus\.js/)){
		res.setHeader('Content-Type', 'text/javascript');
	  require('fs').createReadStream(__dirname + '/primus.js').pipe(res);
	}else if(req.url.match(/tick\.mp3/)){
		res.setHeader('Content-Type', 'audio/mpeg');
	  require('fs').createReadStream(__dirname + '/tick.mp3').pipe(res);
	}else if(req.url.match(/tvod\.mp3/)){
		res.setHeader('Content-Type', 'audio/mpeg');
	  require('fs').createReadStream(__dirname + '/tvod.mp3').pipe(res);
	}else{
		res.setHeader('Content-Type', 'text/html');
	  require('fs').createReadStream(__dirname + '/index.html').pipe(res);
	}
  
});


var Primus = require('primus')
  , latency = require('primus-spark-latency')
  , http = require('http').Server
  , expect = require('expect.js')
  , opts = { transformer: 'websockets' }
  , alt_opts = { transformer: 'websockets', use_clock_offset: true }
  , primus = new Primus(server, opts).use('spark-latency', latency)
  , offset = 0

 //write out primus.js
 primus.save(__dirname +'/primus.js');


//
// listen for connections and echo the events send.
//
primus.on('connection', function connection(spark) {
  spark.on('data', function received(data) {
  	console.log(spark.id, 'received message:',data.msg, ' latency:',spark.latency, ' offset:',offset);
    if(data.msg != undefined){
    	if(data.msg.match(/sync/)){
	    	offset = data.offset;
	    	primus.write({ msg: 'sync', offset: offset, latency: spark.latency, spark_id: spark.id });
	    }else if(data.msg.match(/play/)){
	    	primus.write({ msg: 'play', offset: offset, latency: spark.latency, spark_id: spark.id });
	    }else if(data.msg.match(/pause/)){
	    	primus.write({ msg: 'pause', offset: offset, latency: spark.latency, spark_id: spark.id });
	    }
    }
    
    //spark.write(data);

  });
});

server.listen(8080, function () {
  console.log('Open http://localhost:8080 in your browser');
});
