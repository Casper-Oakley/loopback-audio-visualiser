var amqp = require('amqplib/callback_api');


var hue = 0;


module.exports = function (socket) {
  amqp.connect('amqp://localhost', function(err, conn) {
    if(err) {
      console.log('Error connecting to AMQP server: ' + err);
    } else {
      conn.createChannel(function(err, ch) {
        if(err) {
          console.log('Error creating channel: ' + err);
        } else {
          ch.assertQueue('primary-queue', {durable: true});
          
          //On message received...
          ch.consume('primary-queue', function(msg) {
            var readings = msg.content.toString().split(',');
            var readings = readings.map(function(e, i) {
              return readingToRGB(Math.abs(parseFloat(e)), 1, 0, i, readings.length);
            });
            //console.log(readings);
            //Send readings to every socket
            socket.sockets.emit('reading', { readings: readings });
          }, {noAck: true});

          socket.on('connection', function() {
            console.log('New Connection!!');
          });

        }
      });
    }
  });
  
};


//Timer for the slow changing of hue
setInterval(function() {
  hue = ++hue%360;
}, 100);

var readingToRGB = function(x, max, min, index, length) {
  return HSVtoRGB((hue+(index*120)/length)/360, 0.8, (Math.abs(x-min)/Math.abs(max-min)));
};



//Courtesy of Paul S., from stackoverflow
var HSVtoRGB = function(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}
