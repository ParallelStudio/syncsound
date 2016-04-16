var sound = (function() {

    var audioContext;
    var pendingFiles = 0;

    var sounds = {
      "tick" : {
        "path" : "audio/tick.mp3",
        "loop" : false,
        "loopTime" : [0.0, 1.1],
        "pitchSpread" : [1, 1]
      }
    };

    var globalGain;
    var loaded = false;
    var enabled = true;

    function playSound(buffer, gain) {
     if(!loaded || !enabled){
       return;
      }

      var source = audioContext.createBufferSource();
      source.buffer = buffer;
      
      var soundGain = audioContext.createGain();
      soundGain.gain.value = gain || 1;
      
      source.connect(soundGain);
      soundGain.connect(globalGain);
      source.noteOn(0);
    }

    function loadBuffer(url, name, callback){
      var request = new XMLHttpRequest();

      request.open('GET',url, true);
      request.responseType = 'arraybuffer';

      request.onload = function() {
        audioContext.decodeAudioData(request.response, function(buffer){
          callback(buffer, name);
        });
      };

      request.send();
    }
    function createAudioContext() {
      if (typeof AudioContext !== "undefined") {
          return new AudioContext();
      } else if (typeof webkitAudioContext !== "undefined") {
          return new webkitAudioContext();
      } else {
          alert("No audio.");
          throw new Error('Audio not supported.');
      }
    }

    function init(onReady) {

      audioContext = createAudioContext();
      
      globalGain = audioContext.createGain();
      globalGain.connect(audioContext.destination);

      for(var itm in sounds){
        if(sounds.hasOwnProperty(itm)){
          
          pendingFiles++;

          loadBuffer(sounds[itm].path, itm, function(buff, name) {
            sounds[name].buffer = buff;

            pendingFiles--;
            if(pendingFiles <= 0) {
              onReady();
            }
          });
        }
      }
    }

    return {

      isLoaded : function() {
        return loaded;
      },

      initialize : function(onReady) {
        init(onReady);
        loaded = true;
      },

      getSound : function(sound) {
        if(sounds[sound]){
          var source = audioContext.createBufferSource();
          
          source.buffer = sounds[sound].buffer;
          source.loop = sounds[sound].loop;



         if(sounds[sound].loopTime) {
            source.loopStart = sounds[sound].loopTime[0];
            source.loopEnd = sounds[sound].loopTime[1];
          }

          var gain = audioContext.createGain();
          source.connect(gain);
          gain.connect(globalGain);

          return {
            "setGain" : function(value){
              gain.gain.value = value;
            },
            "stop" : function(){
              source.stop();
            },
            "start" : function(){
              source.start(1);
            }
          }
        }
      },

      playSound : function(sound) {
        if(sounds[sound]) {
          var source = audioContext.createBufferSource();

          source.buffer = sounds[sound].buffer;
          source.gain = audioContext.createGain();
          source.connect(source.gain);

          if(sounds[sound].pitchSpread){
            source.playbackRate.value = Math.random() * (sounds[sound].pitchSpread[1] - sounds[sound].pitchSpread[0]) + sounds[sound].pitchSpread[0];
          }
          
          source.gain.connect(globalGain);

          source.start(0);

          return source;
        }
      }
    }
  })();
