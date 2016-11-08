var amqp     = require('amqplib/callback_api'),
    defaults = require('../defaults');


var hue = 0;

module.exports = function (led) {
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
            var readings = msg.content.toString().split(',').map(function(e) {
              return parseFloat(e);
            });

            led.writeToLed(readings);
            
            //Send readings to every socket
          }, {noAck: true});
        }
      });
    }
  });
};


