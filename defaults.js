module.exports = {
  hue: function(i, length, t) {
    return ((t%360) + (i*120)/length)/360;
  },
  sat: function(i, length, t) {
    return 0.8;
  }
};
