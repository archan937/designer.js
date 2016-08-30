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
