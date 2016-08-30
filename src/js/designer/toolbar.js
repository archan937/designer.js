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
