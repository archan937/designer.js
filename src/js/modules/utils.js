mod.define('Utils', function() {
  return {

    vw: function(px) {
      return parseInt(px) / viewWidth() * 100;
    },

    vh: function(px) {
      return parseInt(px) / viewHeight() * 100;
    },

    vwPosition: function(el) {
      el = $(el);
      var bounds = el.bounds();
      el.css({
        top: (vh(bounds.top) * (viewHeight() / viewWidth())) + 'vw',
        left: vw(bounds.left) + 'vw',
      });
    },

    invertHex: function(color) {
      color = color.substring(1);            // remove '#'
      color = parseInt(color, 16);           // convert to integer
      color = 0xFFFFFF ^ color;              // invert three bytes
      color = color.toString(16);            // convert to hex
      color = ('000000' + color).slice(-6);  // pad with leading zeros
      color = '#' + color;                   // prepend '#'
      return color;
    }

  };
});
