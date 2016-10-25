var amqp = require('amqplib/callback_api');

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
            var readings = msg.content.toString().split(',').map(function(e) {
              return parseFloat(e);
            });
            //Send readings to every socket
            socket.sockets.emit('reading', {readings: readings,
              max: Math.max.apply(Math, readings),
              min: Math.min.apply(Math, readings)
            });
          }, {noAck: true});

          socket.on('connection', function() {
            console.log('New Connection!!');
          });

        }
      });
    }
  });
  
};
