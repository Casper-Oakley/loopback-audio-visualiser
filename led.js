var hue = function(index, length, time){return 1;},
    sat = function(index, length, time){return 1;};

module.exports = function(socket) {
  socket.on('connection', function() {
    console.log('New Connection!!');
  });
  return {
    //setHue sets the function to calculate the hue
    setHue: function(f) {
      hue = f;
    },
    //setSat sets the function to calculate the sat
    setSat: function(f) {
      sat = f;
    },
    //writeToLed function writes a set of values to LEDs (using hue and sat funcs)
    writeToLed: function(values) {
      values = values.map(function(e, i) {
        return HSVtoRGB(hue(i, values.length, timeElapsed), sat(i, values.length, timeElapsed), e);
      });
      socket.sockets.emit('reading', { readings: values });
    }
  };
};


//Timer to be optionally used for any hue/sat functions
//represents the total amount of 100ms that have passed
//(loops round at a large number to not grow tooo big)
var timeElapsed = 0;
setInterval(function() {
  timeElapsed = ++timeElapsed%(360000000);
}, 100);




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
