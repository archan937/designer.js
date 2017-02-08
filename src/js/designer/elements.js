mod.define('Designer.Elements', function() {
  var

  elClass = 'ds-el',
  selectedClass = 'ds-selected',
  transparentClass = 'ds-transparent',
  wrapperClass = 'ds-el-wrapper',

  emptyAttribute = 'ds-empty',

  elSelector = '.' + elClass,
  selectedSelector = '.' + selectedClass,
  wrapperSelector = '.' + wrapperClass,

  cssFor = function(type) {
    return {
      text: {
        'font-size': '4vw'
      },
      image: {
        'width': '20vw',
        'height': '10vw',
        'backgroundImage': 'url(https://unsplash.it/400/200/?random&t=' + Date.now() + ')',
        'backgroundRepeat': 'no-repeat',
        'backgroundSize': 'cover'
      }
    }[type] || {};
  },

  addElement = function(type) {
    $(selectedSelector).removeClass(selectedClass);

    var
      text = (type == 'text' ? 'text' : ''),
      el = $('<div class="' + elClass + ' ds-el-' + type + ' ' + transparentClass + '">' + text + '</div>'),
      css = cssFor(type);

    el.
      attr('ds-empty', true).
      css(css).
      appendTo('body').
      css({
        top: ((50 - (vh(el.height()) / 2)) * (viewHeight() / viewWidth())) + 'vw',
        left: (50 - (vw(el.width()) / 2)) + 'vw',
      }).
      draggable({
        stop: function(e, el) {
          vwPosition(el);
          if (!el.hasClass(selectedClass)) {
            selectElement(el);
          }
        }
      });

    setTimeout(function() { selectElement(el.removeClass(transparentClass)); }, 50);
  },

  selectElement = function(el) {
    deselectElement();
    if (el.is(elSelector)) {
      el.addClass(selectedClass);
      resizable(el);
    }
  },

  deselectElement = function() {
    var selected = $(selectedSelector);

    $('.ds-resize-handle').draggable(false).remove();

    selected.removeClass(selectedClass).each(function() {
      var element = $(this), html = element.html();

      if (element.attr('contenteditable')) {
        element.edit(false);
        if (html.length) {
          element.removeAttr(emptyAttribute);
        } else {
          element.attr(emptyAttribute, true).html('text');
        }
        if (html != element.attr('data-text')) {
          vwPosition(element);
        }
      }
    });

    $(wrapperSelector).each(function() {
      $(this).children().appendTo('body');
    }).remove();
  },

  resizable = function(el) {
    if (el.find('.ds-resize-handle').length)
      return;

    var
      options = {
        constraintX: function(el) {
          return el.hasClass('ds-resize-tm') || el.hasClass('ds-resize-bm');
        },
        constraintY: function(el) {
          return el.hasClass('ds-resize-cl') || el.hasClass('ds-resize-cr');
        },
        start: function(e, el) {
          var
            draggable = el.parent(),
            bounds = draggable.bounds();
          draggable.css({
            width: '',
            height: '',
            bottom: bounds.bottom + 'px',
            right: bounds.right + 'px'
          });
        },
        move: function(e, el, position) {
          var
            draggable = el.parent(),
            bounds = draggable.bounds();

          if (el.hasClass('ds-resize-tl') || el.hasClass('ds-resize-tm') || el.hasClass('ds-resize-cl')) {
            if (position.top) draggable.css({top: (bounds.top + parseInt(position.top)) + 'px'});
            if (position.left) draggable.css({left: (bounds.left + parseInt(position.left)) + 'px'});
          }

          if (el.hasClass('ds-resize-bm') || el.hasClass('ds-resize-br') || el.hasClass('ds-resize-cr')) {
            if (position.top) draggable.css({bottom: (bounds.bottom - (parseInt(position.top) - bounds.height)) + 'px'});
            if (position.left) draggable.css({right: (bounds.right - (parseInt(position.left) - bounds.width)) + 'px'});
          }

          if (el.hasClass('ds-resize-tr')) {
            draggable.css({
              top: (bounds.top + parseInt(position.top)) + 'px',
              right: (bounds.right - (parseInt(position.left) - bounds.width)) + 'px'
            });
          }

          if (el.hasClass('ds-resize-bl')) {
            draggable.css({
              bottom: (bounds.bottom - (parseInt(position.top) - bounds.height)) + 'px',
              left: (bounds.left + parseInt(position.left)) + 'px'
            });
          }

          delete position.top;
          delete position.left;
        },
        stop: function(e, el) {
          var
            draggable = el.parent(),
            bounds = draggable.bounds(),
            style = draggable.computedStyle();
          draggable.css({
            width: vw(
              bounds.width -
              parseInt(style.paddingLeft) -
              parseInt(style.paddingRight) -
              parseInt(style.borderLeft) -
              parseInt(style.borderRight)
            ) + 'vw',
            height: vh(
              bounds.height -
              parseInt(style.paddingTop) -
              parseInt(style.paddingBottom) -
              parseInt(style.borderTop) -
              parseInt(style.borderBottom)
            ) + 'vh',
            bottom: '',
            right: ''
          });
        }
      };

    $('<div class="ds-resize-handle ds-resize-tl"></div>').draggable(options).appendTo(el);
    $('<div class="ds-resize-handle ds-resize-tm"></div>').draggable(options).appendTo(el);
    $('<div class="ds-resize-handle ds-resize-tr"></div>').draggable(options).appendTo(el);
    $('<div class="ds-resize-handle ds-resize-cl"></div>').draggable(options).appendTo(el);
    $('<div class="ds-resize-handle ds-resize-cr"></div>').draggable(options).appendTo(el);
    $('<div class="ds-resize-handle ds-resize-bl"></div>').draggable(options).appendTo(el);
    $('<div class="ds-resize-handle ds-resize-bm"></div>').draggable(options).appendTo(el);
    $('<div class="ds-resize-handle ds-resize-br"></div>').draggable(options).appendTo(el);
  },

  editElement = function(el) {
    if (el.hasClass('ds-el-text')) {
      editText(el);
    }
    if (el.hasClass('ds-el-image')) {
      editImage(el);
    }
  },

  editText = function(el) {
    if (el.attr('contenteditable'))
      return;

    var
      bounds = el.bounds(),
      orientation = (bounds.left <= bounds.right ? 'left' : 'right'),
      css = {
        top: bounds.top + 'px',
        width: (
          ((bounds[orientation] + (bounds.width / 2)) * 2) +
          parseInt(el.computedStyle()['border-' + orientation + '-width'])
        ) + 'px'
      },
      range,
      selection;

    css[orientation] = 0;

    if (!el.style().width) {
      $('<div class="' + wrapperClass + '"></div>').
        css(css).
        appendTo('body').
        append(el);
    }

    el.attr('data-text', (el.at(0).text || '').trim());
    if (el.attr(emptyAttribute)) {
      el.html('');
    }
    el.edit();

    range = document.createRange();
    selection = window.getSelection();
    range.setStart(el[0], el.html().length ? 1 : 0);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  },

  editImage = function() {
    alert('Edit image');
  },

  editBackground = function() {
    alert('Edit background');
  },

  bind = function() {
    var pos;

    $('body').bind('mousedown', function(e, target) {
      pos = {X: e.pageX, Y: e.pageY};
    });

    $('body').bind('click', function(e, target) {
      if (pos.X != e.pageX || pos.Y != e.pageY) {
        return;
      }
      target = $(target);
      if (target.is(selectedSelector)) {
        editElement(target);
      } else {
        selectElement(target);
      }
    });

    $('body').bind('dblclick', function(e, target) {
      if (pos.X != e.pageX || pos.Y != e.pageY) {
        return;
      }
      target = $(target);
      if (target.is(elSelector)) {
        editElement(target);
      }
    });

    $('body').bind('keyup', function(e, target) {
      if (e.keyCode == 27)
        selectElement($('[contenteditable]'));
    });
  };

  return {
    Elements: {

      addElement: addElement,
      deselectElement: deselectElement,
      editBackground: editBackground,

      ready: function() {
        bind();
      }

    }
  };
});
