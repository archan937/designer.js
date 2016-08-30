var mod = (function() {
  'use strict';

  var modules = {};

  return {
    define: function(name, mod) {
      modules[name] = (typeof(mod) == 'function') ? mod : function() { return mod; };
    },
    new: function(init) {
      var body = [], i, mod, module, prop = '__prop__';

      for (i = 1; i < arguments.length; i++) {
        mod = arguments[i];
        module = modules[mod];

        if (mod.match(/\./)) {
          mod = mod.replace('.', '_');
        }

        body.push('var ' + mod + ' = (' + module.toString() + '());');
        body.push('');
        body.push('for (var ' + prop + ' in ' + mod + ') { ');
        body.push('  eval(\'var \' + ' + prop + ' + \' = ' + mod + '.\' + ' + prop + ');');
        body.push('}');
        body.push('');
      }

      body.push(init.toString().replace(/^function\s*\(\)\s*\{/, '').replace(/\}$/, ''));

      return (new Function(body.join('\n'))());
    }
  };
}());

var define = mod.new;

mod.define('Collections', function() {
  return {
    extend: function(target, object) {
      for (var key in object) {
        target[key] = object[key];
      }
      return target;
    },

    keys: function(object) {
      var keys = [], prop;
      for (prop in object) {
        if (object.hasOwnProperty(prop)) {
          keys.push(prop);
        }
      }
      return keys;
    },

    indexOf: function(val, array) {
      for (var i = 0; i < array.length; i += 1) {
        if (val === array[i]) {
          return i;
        }
      }
      return -1;
    },

    forEach: function(array, f) {
      for (var i = 0; i < array.length; i += 1) {
        f(array[i], i, i == array.length - 1);
      }
    },

    select: function(array, f) {
      var selected = [];
      forEach(array, function(el) {
        if (f(el)) {
          selected.push(el);
        }
      })
      return selected;
    },

    pickRandom: function(array) {
      return array[Math.floor(Math.random() * array.length)];
    }
  };
});

mod.define('Config', function() {
  var
    registered = [];

  return {
    registerConfig: function(config) {
      for (var param in config) {
        registered.push({
          param: param,
          func: config[param]
        });
      }
    },

    configure: function() {
      var param, i, spec;
      for (param in script.params) {
        for (i = 0; i < registered.length; i++) {
          spec = registered[i];
          if (spec.param == param) {
            spec.func(script.params[param]);
          }
        }
      }
    }
  };
});

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

mod.define('Elements', function() {
  var

    fn = {
      find: function(selector) {
        return $(selector, this);
      },

      children: function() {
        var children = [];
        children.at = true;
        for (var i = 0; i < this.childNodes.length; i++) {
          node = this.childNodes[i];
          if (node instanceof HTMLElement) {
            children.push(node);
          }
        }
        return children;
      },

      parent: function() {
        return this.parentNode;
      },

      closest: function(sel, elements, context) {
        context || (context = root(this));
        elements || (elements = $(sel, context));

        if (indexOf(this, elements) != -1) {
          return this;
        } else {
          return $(this.parentNode).closest(sel, elements, context);
        }
      },

      show: function() {
        this.style.display = 'initial';
      },

      hide: function() {
        this.style.display = 'none';
      },

      remove: function() {
        this.parentNode.removeChild(this);
      },

      is: function(sel) {
        return indexOf(this, $(sel)) != -1;
      },

      html: function(val) {
        if (arguments.length) {
          this.innerHTML = val;
        } else {
          return this.innerHTML;
        }
      },

      root: function() {
        return root(this);
      },

      edit: function(edit) {
        if (edit == false) {
          this.removeAttribute('contenteditable');
        } else {
          this.setAttribute('contenteditable', 'true');
        }
      },

      addClass: function(arg) {
        var classes = arg.split(' '), i, name;
        for (i = 0; i < classes.length; i += 1) {
          name = classes[i];
          if (name.length && (indexOf(name, this.classList) == -1)) {
            this.classList.add(name);
          }
        }
      },

      removeClass: function(arg) {
        var classes = arg.split(' '), i, name;
        for (i = 0; i < classes.length; i += 1) {
          name = classes[i];
          if (name.length) {
            this.classList.remove(name);
          }
        }
        if (!this.classList.length) {
          this.removeAttribute('class');
        }
      },

      hasClass: function(arg) {
        for (var i = 0; i < this.classList.length; i += 1) {
          if (this.classList[i].toLowerCase() == arg.toLowerCase()) {
            return true;
          }
        }
        return false;
      },

      innerWrap: function(tag, attributes) {
        var attrs = '', name;
        for (name in (attributes || {})) {
          attrs += ' ' + name + '="' + attributes[name].toString().replace(/\n/g, "\\n").replace(/\"/g, "\\\"") + '"';
        }
        this.innerHTML = '<' + tag + attrs + '>' + this.innerHTML + '</' + tag + '>';
      },

      outerWrap: function(tag, attributes) {
        var outerEl = document.createElement(tag), name;
        for (name in (attributes || {})) {
          outerEl.setAttribute(name, attributes[name]);
        }
        this.parentNode.insertBefore(outerEl, this);
        outerEl.appendChild(this);
        return outerEl;
      },

      focus: function() {
        this.focus();
      },

      bind: function() {
        bind.apply(window, [this].concat(Array.prototype.slice.call(arguments)));
      },

      unbind: function() {
        unbind.apply(window, [this].concat(Array.prototype.slice.call(arguments)));
      },

      on: function() {
        var args = Array.prototype.slice.call(arguments);
        args[3] || (args[3] = root(this));
        on.apply(window, args);
      },

      trigger: function() {
        trigger.apply(window, [this].concat(Array.prototype.slice.call(arguments)));
      },

      width: function() {
        var c = computed(this);
        return parseInt(c.width) +
               parseInt(c.borderLeftWidth) +
               parseInt(c.paddingLeft) +
               parseInt(c.borderRightWidth) +
               parseInt(c.paddingRight);
      },

      height: function() {
        var c = computed(this);
        return parseInt(c.height) +
               parseInt(c.borderTopWidth) +
               parseInt(c.paddingTop) +
               parseInt(c.borderBottomWidth) +
               parseInt(c.paddingBottom);
      },

      bounds: function() {
        return bounds.apply(window, [this].concat(Array.prototype.slice.call(arguments)));
      },

      style: function() {
        return this.style;
      },

      attr: function() {
        var key = arguments[0], value = arguments[1], attr;
        if (arguments.length == 1) {
          if (typeof(key) == 'string') {
            return this.getAttribute(key);
          } else {
            for (attr in key) {
              this.setAttribute(attr, key[attr]);
            }
          }
        } else {
          this.setAttribute(key, value);
        }
      },

      removeAttr: function(attr) {
        this.removeAttribute(attr);
      },

      css: function() {
        var key = arguments[0], value = arguments[1], prop;
        if (arguments.length == 1) {
          if (typeof(key) == 'string') {
            return computed.apply(window, [this].concat(Array.prototype.slice.call(arguments)))[key];
          } else {
            for (prop in key) {
              this.style[prop] = key[prop];
            }
          }
        } else {
          this.style[key] = value;
        }
      },

      appendTo: function(parent) {
        $(parent).each(function(i, node) {
          node.appendChild(this);
        }.bind(this));
      },

      append: function(child) {
        $(child).each(function(i, node) {
          this.appendChild(node);
        }.bind(this));
      },

      toShadowDom: function(id) {
        if (document.body.createShadowRoot) {
          var body = document.body, el = $('#' + id)[0];
          if (!el) {
            el = document.createElement('div');
            el.id = id;
            document.body.appendChild(el);
            el.createShadowRoot();
          }
          el.shadowRoot.appendChild(this);
        }
      },

      draggable: function(arg) {
        Draggable[(arg == false) ? 'stop' : 'init'](this, arg);
      }
    },

  newElement = function(html) {
    if ((typeof(html) == 'string') && html.match(/^\<(\w+).+\<\/\1\>$/)) {
      var el = document.createElement('div');
      el.innerHTML = html;
      return wrap(el.childNodes[0]);
    }
  },

  search = function(sel, context) {
    context || (context = document);

    var i, found = [], array = [], parents,
        f = {'#': 'ById', '.': 'sByClassName', '@': 'sByName'}[sel.charAt(0)],
        s = (f ? sel.slice(1) : sel),
        fn = 'getElement' + (f || 'sByTagName');

    if (sel.match(/(\[|\(|\=|\:)/) || sel.match(/[^\s](\#|\@|\.)/)) {
      if (context.querySelectorAll) {
        return context.querySelectorAll(sel);
      }
    }

    if (sel.match(/\s/)) {
      array = sel.split(' '), parents = $(array.shift(), context);
      for (i = 0; i < parents.length; i += 1) {
        found = found.concat($(array.join(' '), parents[i]));
      }
    } else {
      found = context[fn] ? context[fn](s) : context.querySelectorAll(s);
      if (f == 'ById') {
        found = [found];
      } else {
        for (i = 0; i < found.length; i += 1) {
          array.push(found[i]);
        }
        found = array;
      }
    }

    for (i = 0; i < found.length; i++) {
      if (!found[i]) {
        found.splice(i, 1);
      }
    }

    return found;
  },

  wrap = function(arg) {
    if ((arg === null) || (typeof(arg) == 'undefined')) {
      return wrap([]);
    }
    if (!arg.at) {
      if (arg.nodeType) {
        arg = [arg];
      }
      for (var prop in fn) {
        if (fn.hasOwnProperty(prop)) {
          define(prop, arg);
        }
      }
      arg.at = function(i) {
        return this[i];
      };
      arg.each = function(f) {
        for (var i = 0; i < this.length; i++) {
          f.apply(this[i], [i, this[i]]);
        }
        return this;
      };
    }
    return arg;
  },

  define = function(name, elements) {
    elements[name] = function() {
      var
        func = fn[name],
        results = [],
        i, el, result;

      for (i = 0; i < elements.length; i++) {
        el = elements[i];
        result = func.apply(el, arguments);

        if (typeof(result) == 'undefined') {
          result = el;
        }

        if (result && result.nodeType) {
          results.push(result);
        } else if (result && result.at) {
          results = results.concat(result);
        } else {
          return result;
        }
      }

      return wrap(results);
    };
  };

  return {
    $: function(arg, context) {
      return newElement(arg) || wrap(
        (typeof(arg) == 'string') ? search(arg, context) : arg
      );
    }
  };
});

mod.define('Events', function() {
  return {
    bind: function(el, type, f, remove) {
      fn = function(e) {
        f(e, e.target || e.srcElement || window.event.target || window.event.srcElement);
      };

      var tf = type + fn;

      if (el && (el.attachEvent ? (remove ? el.detachEvent('on' + type, el[tf]) : 1) : (remove ? el.removeEventListener(type, fn, 0) : el.addEventListener(type, fn, 0)))) {
        el['e' + tf] = fn;
        el[tf] = function() { el['e' + tf](window.event); };
        el.attachEvent('on' + type, el[tf]);
      }

      el._events || (el._events = {});
      el._events[type] || (el._events[type] = []);

      if (remove) {
        el._events[type].splice(indexOf(fn, el._events[type]), 1);
      } else {
        el._events[type].push(fn);
      }
    },

    unbind: function(el, type, fn) {
      if (fn) {
        bind(el, type, fn, true);
      } else {
        var fns = (el._events || {})[type] || [], i;
        for (i = 0; i < fns.length; i++) {
          unbind(el, type, fns[i]);
        }
      }
    },

    on: function(sel, type, fn, context) {
      context || (context = document);

      bind(context, type, function(e, target) {
        target = $(target).closest(sel);
        if (target.length) {
          fn(e, target);
        }
      });
    },

    trigger: function(el, name) {
      var event;

      if (document.createEvent) {
        event = document.createEvent('Event');
        event.initEvent(name, true, true);
      } else {
        event = document.createEventObject();
        event.eventType = name;
      }

      event.eventName = name;

      if (document.createEvent) {
        el.dispatchEvent(event);
      } else {
        el.fireEvent('on' + name, event);
      }
    },

    animationEnd: function() {
      var
        style = document.body.style,
        mapping = {
          'WebkitAnimation': 'webkitAnimationEnd',
          'OAnimation': 'oAnimationEnd',
          'msAnimation': 'MSAnimationEnd'
        },
        prop;

      for (prop in mapping) {
        if (mapping.hasOwnProperty(prop) && typeof(style[prop]) == 'string') {
          return mapping[prop];
        }
      }

      return 'animationend';
    },

    ready: function(fn) {
      '\v' == 'v' ? setTimeout(fn, 0) : bind(document, 'DOMContentLoaded', function(){ setTimeout(fn, 0) });
    }
  };
});

mod.define('Inject', function() {
  var
    registered = {
      js: [], css: [], html: []
    },

  ensureHead = function() {
    if (!$('head').length) {
      document.body.parentNode.insertBefore(document.createElement('head'), document.body);
    }
    return $('head')[0];
  };

  return {
    registerJS: function() {
      registered.js.push(arguments);
    },

    registerCSS: function() {
      registered.css.push(arguments);
    },

    registerHTML: function(code) {
      registered.html.push(code);
    },

    injectCode: function() {
      var head = ensureHead(), i, el, val;

      for (i = 0; i < registered.js.length; i++) {
        val = registered.js[i];
        el = document.createElement('script');
        if (val[1])
          el.id = val[1];
        el.innerHTML = val[0];
        head.insertBefore(el, head.childNodes[0]);
      }

      for (i = 0; i < registered.css.length; i++) {
        val = registered.css[i];
        el = document.createElement('style');
        if (val[1])
          el.id = val[1];
        el.innerHTML = val[0];
        head.insertBefore(el, head.childNodes[0]);
      }

      for (i = 0; i < registered.html.length; i++) {
        el = document.createElement('div');
        el.innerHTML = registered.html[i];
        while (el.children.length > 0) {
          document.body.appendChild(el.children[0]);
        }
      }
    },

    injectCSS: function(selector, style) {
      var el = $('style.injected')[0], head, css = [], attr;

      if (!el) {
        head = ensureHead();
        el = document.createElement('style');
        addClass(el, 'injected');
        head.insertBefore(el, head.childNodes[0]);
      }

      css.push('\n' + selector + ' {');
      for(attr in style) {
        css.push('  ' + attr + ': ' + style[attr] + ';');
      };
      css.push('}');

      el.innerHTML += css.join('\n') + '\n';
    }
  };
});

mod.define('Introspect', function() {
  return {
    script: (function() {
      var id = 'dummy', dummy, script, src, params = {}, pairs, i, key_value, key;
      document.write('<script id="' + id + '"></script>');

      dummy = document.getElementById(id);
      script = dummy.previousSibling;
      dummy.parentNode.removeChild(dummy);

      src = script.getAttribute('src');
      pairs = ((src.match(/([\?]*)\?(.*)+/) || ['', '', ''])[2] || '').replace(/(^[0123456789]+|\.js(\s+)?$)/, '').split('&');

      for (i = 0; i < pairs.length; i += 1) {
        if (pairs[i] != '') {
          key_value = pairs[i].split('=');
          key = key_value[0].replace(/^\s+|\s+$/g, '').toLowerCase();
          params[key] = (key_value.length == 1) || key_value[1].replace(/^\s+|\s+$/g, '');
        }
      }

      return {
        path: src.toLowerCase().replace(/[^\/]+\.js.*/, ''),
        params: params
      };
    }()),

    isRetinaDisplay: function() {
      if (window.matchMedia) {
        var mq = window.matchMedia('only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen  and (min-device-pixel-ratio: 1.3), only screen and (min-resolution: 1.3dppx)');
        return (mq && mq.matches || (window.devicePixelRatio > 1));
      }
      return false;
    },

    inFrame: function() {
      return parent !== window;
    },

    pageWidth: function() {
      return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    },

    pageHeight: function() {
      return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    },

    viewWidth: function() {
      return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    },

    viewHeight: function() {
      return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    },

    viewTop: function() {
      return window.pageYOffset;
    },

    viewLeft: function() {
      return window.pageXOffset;
    },

    bounds: function(el) {
      var rect = el.getBoundingClientRect(),
          bounds = {
            top: parseInt(rect.top + viewTop()),
            left: parseInt(rect.left + viewLeft()),
            width: parseInt(rect.width),
            height: parseInt(rect.height)
          };

      bounds.bottom = pageHeight() - bounds.top - bounds.height;
      bounds.right = pageWidth() - bounds.left - bounds.width;

      return bounds;
    },

    computed: function(el) {
      return window.getComputedStyle(el);
    },

    root: function(el) {
      return el.parentNode ? root(el.parentNode) : el;
    }
  };
});


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

mod.define('Designer.Toolbar', function() {
  var

  id_shadow_dom = 'ds-shadow-dom',
  id_toolbar = 'ds-toolbar',

  sel_shadow_dom = '#' + id_shadow_dom,
  sel_toolbar = '#' + id_toolbar,

  el = function() {
    var shadow_dom = $(sel_shadow_dom)[0],
        el = [];

    if (shadow_dom) {
      el = $(sel_toolbar, shadow_dom.shadowRoot);
    }

    return el.length ? el : $(sel_toolbar);
  },

  show = function() {
    el().show();
  },

  hide = function() {
    el().hide();
  },

  bind = function() {
    el().on('a', 'click', function(e, target) {
      var type = $(target).html().toLowerCase();
      switch (type) {
        case 'text': case 'image':
          Elements.addElement(type);
          break;
        case 'background':
          Elements.editBackground();
          break;
      }
    });
  };

  return {
    Toolbar: {

      config: {
        show: show
      },

      show: show,
      hide: hide,

      ready: function() {
        $('#ds-css-toolbar').toShadowDom(id_shadow_dom);
        el().toShadowDom(id_shadow_dom);
        bind();
      }

    }
  };
});

if (typeof(Designer) == 'undefined') {

// *
// * designer.js {version} (Uncompressed)
// * A minimalistic Javascript library to design web pages using absolute positioning
// *
// * (c) {year} Paul Engel
// * designer.js is licensed under MIT license
// *
// * $Date: {date} $
// *

Designer = define(function() {

  registerCSS('#ds-toolbar{top:15px;right:15px;position:fixed;display:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}#ds-toolbar *{margin:0;padding:0;list-style:none;outline:0}#ds-toolbar ul{padding:5px 0;color:#222;font-family:"Helvetica Neue","Helvetica","Arial","sans-serif";font-size:12px;font-weight:bold;letter-spacing:-0.35px;border:1px solid #777;background:#FDFDFD;border-radius:5px;-moz-border-radius:5px;-webkit-border-radius:5px;box-shadow:rgba(0,0,0,0.5) 0 1px 2px;-moz-box-shadow:rgba(0,0,0,0.5) 0 1px 2px;-webkit-box-shadow:rgba(0,0,0,0.5) 0 1px 2px}#ds-toolbar ul li{padding:3px 17px 2px 17px;*padding:3px 17px 2px 17px;line-height:1;border-right:1px solid #BBB;display:-moz-inline-block;display:inline-block;zoom:1;*display:inline}#ds-toolbar ul li:first-child{padding:3px 20px 2px 22px;*padding:3px 20px 2px 22px;cursor:default}#ds-toolbar ul li:last-child{border:0;*border:0}#ds-toolbar ul li a{color:#4183C4;text-decoration:none}#ds-toolbar ul li a:hover{cursor:pointer;text-decoration:underline}\n', 'ds-css-toolbar');
  registerCSS('html{height:100%}body{min-height:100%}*[contenteditable]:empty{width:2px;display:block}*[contenteditable]{-webkit-user-select:auto !important;display:inline-block}.ds-el{padding:3px 5px;cursor:default;display:inline-block;position:absolute;outline:none;border:1px solid transparent;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.ds-el.ds-selected{padding:3px 5px;border-color:#4183C4}.ds-el.ds-transparent{opacity:0}.ds-el.ds-el-image.ds-selected{cursor:pointer}.ds-el-wrapper{width:100%;position:absolute;text-align:center}.ds-el-wrapper .ds-el{position:static}\n', 'ds-css-elements');
  registerHTML('<div id="ds-toolbar"><ul><li>Designer</li><li><a>Text</a></li><li><a>Image</a></li><li><a>Background</a></li><li><a>Save</a></li><li><a>Export</a></li></ul></div>');
  registerConfig(Toolbar.config);

  ready(function() {
    injectCode();
    configure();
    Draggable.ready();
    Elements.ready();
    Toolbar.ready();
  });

  return {
    version: '{version}',
    $: $,
    show: Toolbar.show,
    hide: Toolbar.hide
  }

},
  'Utils',
  'Introspect',
  'Collections',
  'Elements',
  'Events',
  'Draggable',
  'Inject',
  'Config',
  'Designer.Toolbar',
  'Designer.Elements'
);

}
