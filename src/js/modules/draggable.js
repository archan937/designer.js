mod.define('Draggable', function() {

  var

  elements = [],
  configs = [],
  dragged,
  moved,
  deltaX,
  deltaY,

  init = function(el, config) {
    if (indexOf(el, elements) == -1) {
      elements.push(el);
      configs.push(config || {});
    }
  },

  stop = function(el) {
    var index = indexOf(el, elements);
    if (index != -1) {
      elements.splice(index, 1);
      configs.splice(index, 1);
    }
  },

  bind = function() {
    var removeSelection = function() {
      if (document.selection) {
        document.selection.empty();
      } else {
        window.getSelection().removeAllRanges();
      }
    };

    $('body').bind('mousedown', function(e, target) {
      if (!dragged && (e.which == 1) && (indexOf(target, elements) != -1)) {
        var config;

        dragged = $(target);
        moved = false;

        deltaX = e.pageX - dragged.bounds().left;
        deltaY = e.pageY - dragged.bounds().top;

        config = configs[indexOf(dragged.at(0), elements)];
        config.start && config.start(e, dragged);
      }
    });

    $('body').bind('mousemove', function(e) {
      if (dragged) {
        removeSelection();

        var
          parent = (dragged.parent().at(0).tagName.toLowerCase() != 'body') ? dragged.parent() : null,
          parentX = parent ? parent.bounds().left : 0,
          parentY = parent ? parent.bounds().top : 0,
          position = {
            top: (e.pageY - deltaY - parentY) + 'px',
            left: (e.pageX - deltaX - parentX) + 'px'
          },
          config = configs[indexOf(dragged.at(0), elements)];

        if (callOrValue(config.constraintY, dragged) == true)
          delete position.top;
        if (callOrValue(config.constraintX, dragged) == true)
          delete position.left;

        config.move && config.move(e, dragged, position);
        dragged.css(position);

        moved = true;
      }
    });

    $('body').bind('mouseup', function(e) {
      if (dragged && moved) {
        var config = configs[indexOf(dragged.at(0), elements)];
        config.stop && config.stop(e, dragged);
      }

      dragged = null;
      moved = false;
    });
  },

  callOrValue = function(val, el) {
    return (typeof(val) == 'function') ? val(el) : val;
  };

  ready(bind);

  return {
    Draggable: {
      init: init,
      stop: stop
    }
  };
});
