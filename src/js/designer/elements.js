mod.define('Designer.Elements', function() {
  var

  class_el = 'ds-el',
  class_selected = 'ds-selected',
  class_transparent = 'ds-transparent',
  class_wrapper = 'ds-el-wrapper',

  attr_empty = 'ds-empty',

  sel_el = '.' + class_el,
  sel_selected = '.' + class_selected,
  sel_wrapper = '.' + class_wrapper,

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
    $(sel_selected).removeClass(class_selected);

    var
      text = (type == 'text' ? 'text' : ''),
      el = $('<div class="' + class_el + ' ds-el-' + type + ' ' + class_transparent + '">' + text + '</div>'),
      css = cssFor(type);

    el.
      attr('ds-empty', true).
      css(css).
      appendTo('body').
      css({
        top: ((50 - (vh(el.height()) / 2)) * (viewHeight() / viewWidth())) + 'vw',
        // top: (50 - (vh(el.height()) / 2)) + 'vh',
        left: (50 - (vw(el.width()) / 2)) + 'vw',
      }).
      draggable({
        stop: function(e, target) {
          vwPosition(target);
          selectElement($(target));
        }
      });

    setTimeout(function() { el.addClass(class_selected).removeClass(class_transparent); }, 50);
  },

  selectElement = function(el) {
    var selected = $(sel_selected);

    selected.removeClass(class_selected).each(function() {
      var element = $(this);

      if (element.attr('contenteditable')) {
        element.edit(false);
        if (element.html().length) {
          element.removeAttr(attr_empty);
        } else {
          element.attr(attr_empty, true).html('text');
        }
        if (element.html() != element.attr('data-text')) {
          vwPosition(element);
        }
      }
    });

    $(sel_wrapper).each(function() {
      $(this).children().appendTo('body');
    }).remove();

    if (el.is(sel_el)) {
      el.addClass(class_selected);
    }
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
        width: ((bounds[orientation] + (bounds.width / 2)) * 2) + 'px'
      },
      range,
      selection;

    css[orientation] = 0;

    $('<div class="' + class_wrapper + '"></div>').
      css(css).
      appendTo('body').
      append(el);

    el.attr('data-text', el.html());
    if (el.attr(attr_empty)) {
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
      if (target.is(sel_selected)) {
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
      if (target.is(sel_el)) {
        editElement(target);
      }
    });
  };

  return {
    Elements: {

      addElement: addElement,
      editBackground: editBackground,

      ready: function() {
        bind();
      }

    }
  };
});
