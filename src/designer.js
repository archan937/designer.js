var mod = (function() {
  var varname = '__props__', modules = {},

  evil = function(object, code) {
    return eval.call(object, code);
  };

  return {
    define: function(name, mod) {
      modules[name] = (typeof(mod) == 'function') ? mod() : mod;
    },
    extend: function(object) {
      evil(object, 'var ' + varname + ' = {}');

      var props = evil(object, varname),
          i, mod, prop;
      for (i = 1; i < arguments.length; i++) {
        mod = modules[arguments[i]];
        for (prop in mod) {
          props[prop] = mod[prop];
          evil(object, 'var ' + prop + ' = ' + varname + '.' + prop);
        }
      }

      evil(object, varname + ' = undefined');
    }
  };
}());

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

mod.define('Elements', function() {
  var

    fn = {
      closest: function(sel, elements) {
        elements || (elements = $(sel));
        if (indexOf(this, elements) != -1) {
          return this;
        } else {
          return $(this.parentNode).closest(sel, elements);
        }
      },

      show: function() {
        this.style.display = 'initial';
      },

      hide: function() {
        this.style.display = 'none';
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

      bind: function() {
        bind.apply(window, [this].concat(Array.prototype.slice.call(arguments)));
      },

      unbind: function() {
        unbind.apply(window, [this].concat(Array.prototype.slice.call(arguments)));
      },

      on: function() {
        on.apply(window, [this].concat(Array.prototype.slice.call(arguments)));
      },

      trigger: function() {
        trigger.apply(window, [this].concat(Array.prototype.slice.call(arguments)));
      },

      bounds: function() {
        return bounds.apply(window, [this].concat(Array.prototype.slice.call(arguments)));
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

      toShadowDom: function(id) {
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
      found = context[fn] ? context[fn](s) : $[fn](s, context);
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
    if (typeof(arg) == 'undefined') {
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

        if (result.nodeType) {
          results.push(result);
        } else {
          return result;
        }
      }

      return wrap(results);
    };
  };

  return {
    $: function(arg, context) {
      return wrap(
        (typeof(arg) == 'string') ? search(arg, context) : arg
      );
    }
  };
});

mod.define('Events', function() {
  return {
    bind: function(el, type, fn, remove) {
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

    on: function(sel, type, fn) {
      bind(document, type, function(e) {
        var target = closest(e.target || e.srcElement || window.event.target || window.event.srcElement, sel);
        if (target) {
          e.preventDefault ? e.preventDefault() : e.returnValue = false;
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
        el.id = val[1];
        el.innerHTML = val[0];
        head.insertBefore(el, head.childNodes[0]);
      }

      for (i = 0; i < registered.css.length; i++) {
        val = registered.css[i];
        el = document.createElement('style');
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
      var rect = el.getBoundingClientRect();
      return {
        top: parseInt(rect.top + viewTop()),
        left: parseInt(rect.left + viewLeft()),
        width: parseInt(rect.width),
        height: parseInt(rect.height)
      }
    },

    computed: function(el) {
      return window.getComputedStyle(el);
    }
  };
});

mod.define('Designer.Toolbar', function() {
  var

  el = function() {
    var sel = '#ds-toolbar',
        el = $(sel, document.body.shadowRoot);
    return el.length ? el : $(sel);
  },

  show = function() {
    el().show();
  },

  hide = function() {
    el().hide();
  };

  return {
    Toolbar: {

      config: {
        show: show
      },

      show: show,
      hide: hide,

      ready: function() {
        var id = 'ds-shadow-dom';
        $('#ds-css').toShadowDom(id);
        el().toShadowDom(id);
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

Designer = (function() {

  mod.extend(this, 'Introspect');
  mod.extend(this, 'Collections');
  mod.extend(this, 'Elements');
  mod.extend(this, 'Events');
  mod.extend(this, 'Inject');
  mod.extend(this, 'Config');
  mod.extend(this, 'Designer.Toolbar');

  registerCSS('#ds-toolbar{font-family:"Helvetica Neue","Helvetica","Arial","sans-serif";display:none;letter-spacing:-0.35px}\n', 'ds-css');
  registerHTML('<div id="ds-toolbar">Toolbar</div>');
  registerConfig(Toolbar.config);

  ready(function() {
    injectCode();
    configure();
    Toolbar.ready();
  });

  return {
    version: '{version}',
    $: $,
    show: Toolbar.show,
    hide: Toolbar.hide
  }
})();

}
