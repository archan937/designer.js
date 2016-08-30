mod.define('Draggable', function() {

  var

  elements = [],
  configs = {},
  dragged,
  moved,
  deltaX,
  deltaY,

  init = function(el, config) {
    if (indexOf(el, elements) == -1) {
      elements.push(el);
      configs[el] = config || {};
    }
  },

  stop = function(el) {
    var index = indexOf(el, elements);
    if (index != -1) {
      elements.splice(index, 1);
    }
  },

  bind = function() {
    $('body').bind('mousedown', function(e, target) {
      if ((e.which == 1) && (indexOf(target, elements) != -1)) {
        dragged = $(target);
        moved = false;
        deltaX = e.pageX - dragged.bounds().left;
        deltaY = e.pageY - dragged.bounds().top;
      }
    });

    $('body').bind('mousemove', function(e, target) {
      if (dragged) {
        if (!moved) {
          configs[target] && configs[target].start && configs[target].start(e, target);
          moved = true;
        }
        dragged.css({
          top: (e.pageY - deltaY) + 'px',
          left: (e.pageX - deltaX) + 'px'
        });
      }
    });

    $('body').bind('mouseup', function(e, target) {
      if (dragged && moved) {
        configs[target] && configs[target].stop && configs[target].stop(e, target);
      }
      dragged = null;
      moved = false;
    });
  };

  return {
    Draggable: {

      init: init,
      stop: stop,

      ready: function() {
        bind();
      }

    }
  };
});
