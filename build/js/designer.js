var mod, define;

mod = (function() {
  'use strict';

  var modules = {};

  return {
    define: function(name, mod) {
      modules[name] = (typeof(mod) == 'function') ? mod : function() { return mod; };
    },
    construct: function(identifier, init) {
      var
        fn = '__fn__', prop = '__prop__', body = [],
        i, mod, module;

      body.push('var IDENTIFIER = \'' + identifier + '\', ' + fn + ' = {};');
      body.push('');

      for (i = 2; i < arguments.length; i++) {
        mod = arguments[i];
        module = modules[mod];

        if (mod.match(/\./)) {
          mod = mod.replace('.', '_');
        }

        body.push('var ' + mod + ' = (' + module.toString() + '());');
        body.push('');
        body.push('for (var ' + prop + ' in ' + mod + ') { ');
        body.push('  eval(\'var \' + ' + prop + ' + \' = ' + mod + '.\' + ' + prop + ');');
        body.push('  eval(\'' + fn + '.\' + ' + prop + ' + \' = ' + mod + '.\' + ' + prop + ');');
        body.push('}');
        body.push('');
      }

      body.push(init.toString().replace(/(^function\s*\(.*?\)\s*\{\s*|\s*$)/, '').replace(/\}$/, ''));

      return (new Function(body.join('\n'))());
    }
  };
}());

define = mod.construct;

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

mod.define('Elements', function() {
  var
    fn = {
      find: function(selector) {
        return $(selector, this);
      },

      children: function() {
        var children = [], i;
        children.at = true;
        for (i = 0; i < this.childNodes.length; i++) {
          node = this.childNodes[i];
          if (node instanceof HTMLElement) {
            children.push(node);
          }
        }
        return children;
      },

      parent: function() {
        return wrap(this.parentNode);
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
        return this.matches(sel);
      },

      html: function(val) {
        if (arguments.length) {
          this.innerHTML = val;
        } else {
          return this.innerHTML;
        }
      },

      val: function() {
        return this.value;
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

      addClass: function() {
        var classes = ((arguments[0] instanceof Array) ? arguments[0] : arguments);
        classes = Array.prototype.join.call(classes, " ");
        this.classList.add.apply(this.classList, classes.trim().split(/\s+/));
      },

      removeClass: function() {
        var classes = [], i, name, regexp;

        if (arguments[0] instanceof RegExp) {
          regexp = arguments[0];
          for (i = 0; i < this.classList.length; i += 1) {
            name = this.classList[i];
            if (name.match(regexp))
              classes.push(name);
          }
        } else {
          classes = (arguments[0] instanceof Array) ? arguments[0] : arguments;
        }

        this.classList.remove.apply(this.classList, classes);
      },

      hasClass: function(arg) {
        return this.classList.contains(arg);
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
        return wrap(outerEl);
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

      once: function() {
        once.apply(window, [this].concat(Array.prototype.slice.call(arguments)));
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
        var c = computedStyle(this);
        return parseInt(c.width) +
               parseInt(c.borderLeftWidth) +
               parseInt(c.paddingLeft) +
               parseInt(c.borderRightWidth) +
               parseInt(c.paddingRight);
      },

      height: function() {
        var c = computedStyle(this);
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

      computedStyle: function() {
        return computedStyle.apply(window, [this].concat(Array.prototype.slice.call(arguments)));
      },

      cssRules: function() {
        return cssRules.apply(window, [this].concat(Array.prototype.slice.call(arguments)));
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
        var regexp, i;

        if (attr instanceof RegExp) {
          regexp = attr;
          for (i = 0; i < this.attributes.length; i += 1) {
            attr = this.attributes[i].localName;
            if (attr.match(regexp))
              this.removeAttribute(attr);
          }
        } else {
          this.removeAttribute(attr);
        }
      },

      css: function() {
        var key = arguments[0], value = arguments[1], prop;
        if (arguments.length == 1) {
          if (typeof(key) == 'string') {
            return computedStyle.apply(window, [this].concat(Array.prototype.slice.call(arguments)))[key];
          } else {
            for (prop in key) {
              this.style[prop] = key[prop];
            }
          }
        } else {
          this.style[key] = value;
        }
      },

      prev: function(selector) {
        var prev = $(this.previousElementSibling);
        if (selector && !prev.is(selector)) {
          return prev.prev(selector);
        } else {
          return prev;
        }
      },

      next: function(selector) {
        var next = $(this.nextElementSibling);
        if (selector && !next.is(selector)) {
          return next.next(selector);
        } else {
          return next;
        }
      },

      backward: function(selector) {
        var el = $(this).prev(selector);
        if (el.length) {
          this.parentNode.insertBefore(this, el.at(0));
        }
      },

      forward: function(selector) {
        var el = $(this).next(selector);
        if (el.length) {
          next = el.at(0).nextElementSibling;
          next ? this.parentNode.insertBefore(this, next) : this.parentNode.appendChild(this);
        }
      },

      prepend: function(child) {
        $(child).each(function(i, node) {
          var first = this.children[0];
          first ? this.insertBefore(node, first) : this.appendChild(node);
        }.bind(this));
      },

      prependTo: function(parent) {
        $(parent).each(function(i, node) {
          var first = node.children[0];
          first ? node.insertBefore(this, first) : node.appendChild(this);
        }.bind(this));
      },

      append: function(child) {
        $(child).each(function(i, node) {
          this.appendChild(node);
        }.bind(this));
      },

      appendTo: function(parent) {
        $(parent).each(function(i, node) {
          node.appendChild(this);
        }.bind(this));
      },

      before: function(el) {
        $(el).each(function(index, el) {
          this.parentNode.insertBefore(el, this);
        }.bind(this));
      },

      after: function(el) {
        $(el).each(function(index, el) {
          var next = this.nextElementSibling;
          if (next) {
            $(next).before(el);
          } else {
            this.parentNode.appendChild(el);
          }
        }.bind(this));
      },

      toShadowDom: function(id) {
        var body = document.body, el;
        if (body.createShadowRoot) {
          el = $('#' + id)[0];
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
    if ((typeof(html) == 'string') && html.match(/^\<(\w+)(.+(\<\/\1|\/?))?\>$/m)) {
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
      if (context[fn])
        found = context[fn](s);
      else {
        if (f == 'ById') {
          f = null;
          s = '[id="' + s + '"]';
        }
        found = context.querySelectorAll(s);
      }
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
      if (arg.nodeType || !arg.entries) {
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
          results = results.concat(Array.prototype.slice.call(result));
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
  var
    events = {};

  return {
    bind: function(el, type, f, remove) {
      var fn, id;

      if (typeof(f) == 'string') {
        fn = events[f];
      } else {
        id = objectid(el) + ':' + type + ':' + objectid(f);
        fn = events[id] || (events[id] = function(e) {
          e || (e = window.event);
          f(e, e.target || e.srcElement || window.event.target || window.event.srcElement);
        });
      }

      if (remove) {
        if (el.detachEvent)
          el.detachEvent('on' + type, fn);
        else
          el.removeEventListener(type, fn, false);
      } else {
        if (el.attachEvent)
          el.attachEvent('on' + type, fn);
        else
          el.addEventListener(type, fn, false);
      }
    },

    unbind: function(el, type, fn) {
      if (fn) {
        bind(el, type, fn, true);
      } else {
        var regexp = new RegExp('^' + objectid(el) + ':' + type), prop;
        for (prop in events) {
          if (events.hasOwnProperty(prop) && prop.match(regexp)) {
            unbind(el, type, prop);
          }
        }
      }
    },

    once: function(el, type, f) {
      var fn = function() {
        unbind(el, type, fn);
        f.apply(this, arguments);
      };
      bind(el, type, fn);
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
      if ((document.readyState == 'interactive') || (document.readyState == 'complete')) {
        setTimeout(fn, 0);
      } else {
        bind(document, 'DOMContentLoaded', function() { setTimeout(fn, 0) });
      }
    }
  };
});

mod.define('Identifier', function() {
  var
    id = 0;

  return {
    objectid: function(object) {
      if (typeof object.__objectid == 'undefined') {
        Object.defineProperty(object, '__objectid', {
          value: ++id,
          enumerable: false,
          writable: false
        });
      }
      return object.__objectid;
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
        head.appendChild(el);
      }

      for (i = 0; i < registered.css.length; i++) {
        val = registered.css[i];
        el = document.createElement('style');
        if (val[1])
          el.id = val[1];
        el.innerHTML = val[0];
        head.appendChild(el);
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
        $(el).addClass('injected');
        head.insertBefore(el, head.childNodes[0]);
      }

      css.push('\n' + selector + ' {');
      for (attr in style) {
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
      var id = 'dummy_script', dummy, script = document.getElementById(IDENTIFIER), src, params = {}, pairs, pair, key, i;

      if (!script) {
        document.write('<script id="' + id + '"></script>');
        dummy = document.getElementById(id);
        script = dummy.previousSibling;
        dummy.parentNode.removeChild(dummy);
      }

      src = script.getAttribute('src');
      pairs = ((src.match(/([\?]*)\?(.*)+/) || ['', '', ''])[2] || '').replace(/(^[0123456789]+|\.js(\s+)?$)/, '').split('&');

      for (i = 0; i < pairs.length; i += 1) {
        if (pairs[i] != '') {
          pair = pairs[i].split('=');
          key = pair[0].replace(/^\s+|\s+$/g, '').toLowerCase();
          params[key] = (pair.length == 1) || pair[1].replace(/^\s+|\s+$/g, '');
        }
      }

      return {
        el: script,
        src: src.toLowerCase().replace(/\?.*/, ''),
        path: src.toLowerCase().replace(/[^\/]+\.js.*/, ''),
        search: src.toLowerCase().replace(/^[^\?]+/, ''),
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
      var
        rect = el.getBoundingClientRect(),
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

    computedStyle: function(el) {
      return window.getComputedStyle(el);
    },

    cssRules: function(el) {
      var
        sheets = document.styleSheets,
        rules = [],
        i;

      function collectRules(cssRules) {
        var i, rule;
        for (i = 0; i < cssRules.length; i++) {
          rule = cssRules[i];
          if (rule instanceof CSSMediaRule) {
            if (window.matchMedia(rule.conditionText).matches) {
              collectRules(rule.cssRules);
            }
          } else if (rule instanceof CSSStyleRule) {
            if (el.matches(rule.selectorText)) {
              rules.push(rule);
            }
          }
        }
      };

      for (i = 0; i < sheets.length; i++) {
        collectRules(sheets[i].cssRules);
      }

      return rules;
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

      element.removeAttr('data-text');
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

  editPage = function() {
    alert('Edit page');
  },

  init = function() {
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
      editPage: editPage,
      init: init
    }
  };
});

mod.define('Designer.Iframe', function() {
  var

  init = function(url) {
    url || (url = window.location.search.replace(/^\?/, ''));

    if (url) {
      $('<iframe>').addClass('designer').appendTo('body');
      load(url);
    }
  },

  load = function(url) {
    var
      iframe = $('iframe'),
      iframeWindow = iframe[0].contentWindow,
      iframeDocument,
      timestamp = (url.match(/\?\w+/) ? '&' : '?') + 't=' + (new Date()).getTime();

    iframe.bind('load', function() {
      if (iframeWindow.location.href.indexOf(timestamp) != -1) {
        iframeDocument = iframeWindow.document;

        var el = iframeDocument.createElement('script');
        el.id = 'designer.js';
        el.src = script.src + '?edit';

        iframeDocument.body.appendChild(el);
        iframe.focus();
      }
    });

    iframeDocument = iframeWindow.document;
    iframeDocument.open();
    iframeDocument.write('<body onload="window.location.replace(\'' + url + timestamp + '\')">');
    iframeDocument.close();
  };

  return {
    Iframe: {
      init: init,
      load: load
    }
  };
});

mod.define('Designer.Toolbar', function() {
  var

  init = function() {
    $('#ds-toolbar').on('a', 'click', function(e, target) {

      var
        li = $(target).closest('li'),
        type = li.attr('data-type').toLowerCase(),
        iframe = $('iframe.designer')[0],
        Designer = iframe ? iframe.contentWindow.Designer : undefined;

      if (!Designer) return;

      switch (type) {
        case 'text': case 'image':
          Designer.addElement(type);
          break;
        case 'backward':
          Designer.backward();
          break;
        case 'forward':
          Designer.forward();
          break;
        case 'page':
          Designer.editPage();
          break;
        case 'html':
          alert(Designer.getHTML());
          break;
      }

    });
  };

  return {
    Toolbar: {
      init: init
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

Designer = define('designer.js', function() {

  var
    init = function(url) {
      ready(function() {
        registerCSS('/*!\n *  Font Awesome 4.7.0 by @davegandy - http://fontawesome.io - @fontawesome\n *  License - http://fontawesome.io/license (Font: SIL OFL 1.1, CSS: MIT License)\n */.fa.fa-pull-left,.fa.pull-left{margin-right:.3em}.fa,.fa-stack{display:inline-block}.fa-fw,.fa-li{text-align:center}@font-face{font-family:FontAwesome;src:url("data:application/vnd.ms-fontobject;base64,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?#iefix&v=4.7.0") format(\'embedded-opentype\')font-weight:400;font-style:normal}.fa{font:normal normal normal 14px/1 FontAwesome;font-size:inherit;text-rendering:auto;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.fa-lg{font-size:1.33333333em;line-height:.75em;vertical-align:-15%}.fa-2x{font-size:2em}.fa-3x{font-size:3em}.fa-4x{font-size:4em}.fa-5x{font-size:5em}.fa-fw{width:1.28571429em}.fa-ul{padding-left:0;margin-left:2.14285714em;list-style-type:none}.fa.fa-pull-right,.fa.pull-right{margin-left:.3em}.fa-ul>li{position:relative}.fa-li{position:absolute;left:-2.14285714em;width:2.14285714em;top:.14285714em}.fa-li.fa-lg{left:-1.85714286em}.fa-border{padding:.2em .25em .15em;border:.08em solid #eee;border-radius:.1em}.fa-pull-left{float:left}.fa-pull-right,.pull-right{float:right}.pull-left{float:left}.fa-spin{-webkit-animation:fa-spin 2s infinite linear;animation:fa-spin 2s infinite linear}.fa-pulse{-webkit-animation:fa-spin 1s infinite steps(8);animation:fa-spin 1s infinite steps(8)}@-webkit-keyframes fa-spin{0%{-webkit-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(359deg);transform:rotate(359deg)}}@keyframes fa-spin{0%{-webkit-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(359deg);transform:rotate(359deg)}}.fa-rotate-90{-ms-filter:"progid:DXImageTransform.Microsoft.BasicImage(rotation=1)";-webkit-transform:rotate(90deg);-ms-transform:rotate(90deg);transform:rotate(90deg)}.fa-rotate-180{-ms-filter:"progid:DXImageTransform.Microsoft.BasicImage(rotation=2)";-webkit-transform:rotate(180deg);-ms-transform:rotate(180deg);transform:rotate(180deg)}.fa-rotate-270{-ms-filter:"progid:DXImageTransform.Microsoft.BasicImage(rotation=3)";-webkit-transform:rotate(270deg);-ms-transform:rotate(270deg);transform:rotate(270deg)}.fa-flip-horizontal{-ms-filter:"progid:DXImageTransform.Microsoft.BasicImage(rotation=0, mirror=1)";-webkit-transform:scale(-1,1);-ms-transform:scale(-1,1);transform:scale(-1,1)}.fa-flip-vertical{-ms-filter:"progid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1)";-webkit-transform:scale(1,-1);-ms-transform:scale(1,-1);transform:scale(1,-1)}:root .fa-flip-horizontal,:root .fa-flip-vertical,:root .fa-rotate-180,:root .fa-rotate-270,:root .fa-rotate-90{filter:none}.fa-stack{position:relative;width:2em;height:2em;line-height:2em;vertical-align:middle}.fa-stack-1x,.fa-stack-2x{position:absolute;left:0;width:100%;text-align:center}.fa-stack-1x{line-height:inherit}.fa-stack-2x{font-size:2em}.fa-inverse{color:#fff}.fa-file-image-o:before{content:"\\f1c5"}.fa-reply:before{content:"\\f112"}.fa-share:before{content:"\\f064"}.fa-film:before{content:"\\f008"}.fa-file-text-o:before{content:"\\f0f6"}.fa-code:before{content:"\\f121"}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0}.sr-only-focusable:active,.sr-only-focusable:focus{position:static;width:auto;height:auto;margin:0;overflow:visible;clip:auto}');
        registerCSS('iframe.designer{top:0;left:47px;width:calc(100% - 47px);height:100%;position:fixed;border:0}\n');
        registerCSS('#ds-toolbar{top:0;left:0;width:47px;height:100%;list-style:none;position:fixed;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;background:#2E343B}#ds-toolbar,#ds-toolbar *{margin:0;padding:0;outline:0}#ds-toolbar li{display:block}#ds-toolbar li a{width:47px;line-height:47px;color:#9CA7AF;display:block;font-size:15px;text-align:center;text-decoration:none}#ds-toolbar li a:hover{cursor:pointer}#ds-toolbar li[data-type="text"] a{font-family:Times New Roman;font-size:19px}\n');
        registerHTML('<ul id="ds-toolbar"><li data-type="text"><a>T</a></li><li data-type="image"><a><i class="fa fa-file-image-o"></i></a></li><li data-type="backward"><a><i class="fa fa-reply"></i></a></li><li data-type="forward"><a><i class="fa fa-share"></i></a></li><li data-type="page"><a><i class="fa fa-file-text-o"></i></a></li><li data-type="html"><a><i class="fa fa-code"></i></a></li></ul>');
        injectCode();
        Iframe.init(url);
        Toolbar.init();
      });
    },

    load = function(url) {
      Iframe.load(url);
    },

    edit = function() {
      ready(function() {
        registerCSS('html{height:100%}body{min-height:100%}*[contenteditable]:empty{width:2px;display:block}*[contenteditable]{-webkit-user-select:auto !important;display:inline-block}*[contenteditable] .ds-resize-handle{display:none}.ds-el{padding:3px 5px;cursor:default;display:inline-block;position:absolute;outline:none;border:1px solid transparent;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.ds-el.ds-selected{padding:3px 5px;border-color:#4183C4}.ds-el.ds-selected .ds-resize-tl{width:5px;height:5px;position:absolute;background:#fff;border:1px solid #333;top:-4px;left:-4px}.ds-el.ds-selected .ds-resize-tm{width:5px;height:5px;position:absolute;background:#fff;border:1px solid #333;top:-4px;left:calc(50% - 4px)}.ds-el.ds-selected .ds-resize-tr{width:5px;height:5px;position:absolute;background:#fff;border:1px solid #333;top:-4px;right:-4px}.ds-el.ds-selected .ds-resize-cl{width:5px;height:5px;position:absolute;background:#fff;border:1px solid #333;top:calc(50% - 4px);left:-4px}.ds-el.ds-selected .ds-resize-cr{width:5px;height:5px;position:absolute;background:#fff;border:1px solid #333;top:calc(50% - 4px);right:-4px}.ds-el.ds-selected .ds-resize-bl{width:5px;height:5px;position:absolute;background:#fff;border:1px solid #333;bottom:-4px;left:-4px}.ds-el.ds-selected .ds-resize-bm{width:5px;height:5px;position:absolute;background:#fff;border:1px solid #333;bottom:-4px;left:calc(50% - 4px)}.ds-el.ds-selected .ds-resize-br{width:5px;height:5px;position:absolute;background:#fff;border:1px solid #333;bottom:-4px;right:-4px}.ds-el.ds-transparent{opacity:0}.ds-el.ds-el-image.ds-selected{cursor:pointer}.ds-el-wrapper{width:100%;position:absolute;text-align:center}.ds-el-wrapper .ds-el{display:inline-block;position:static}\n', 'ds-elements');
        injectCode();
        Elements.init();
      });
    },

    backward = function() {
      $('.ds-selected').backward('.ds-el');
    },

    forward = function() {
      $('.ds-selected').forward('.ds-el');
    },

    getHTML = function() {
      var
        doc = document.implementation.createHTMLDocument(),
        html = $(doc.body.parentNode);
      Elements.deselectElement();
      html.html(document.body.parentNode.innerHTML);
      html.find('[id="designer.js"]').remove();
      html.find('[id^=ds-]').remove();
      html.find('[id^=am-]').remove();
      html.find('.ds-el').removeClass(/^ds-/).removeAttr(/^ds-/);
      return html.html();
    };

  ready(function() {
    registerConfig({
      init: init,
      edit: edit
    });
    configure();
  });

  return {
    version: '{version}',
    $: $,
    init: init,
    load: load,
    addElement: Elements.addElement,
    backward: backward,
    forward: forward,
    editPage: Elements.editPage,
    getHTML: getHTML
  };

},
  'Identifier',
  'Utils',
  'Introspect',
  'Collections',
  'Elements',
  'Events',
  'Draggable',
  'Inject',
  'Config',
  'Designer.Iframe',
  'Designer.Toolbar',
  'Designer.Elements'
);

}
