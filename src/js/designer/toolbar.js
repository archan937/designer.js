mod.define('Designer.Toolbar', function() {
  var

  el = function() {
    var sel = '#ds-toolbar',
        shadow_dom = $('#ds-shadow-dom')[0],
        el = [];

    if (shadow_dom) {
      el = $(sel, shadow_dom.shadowRoot);
    }

    return el.length ? el : $(sel);
  },

  show = function() {
    el().show();
  },

  hide = function() {
    el().hide();
  },

  bind = function() {
    el().on('a', 'click', function(e, target) {
      console.log(target[0].innerHTML);
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
        var id = 'ds-shadow-dom';
        $('#ds-css').toShadowDom(id);
        el().toShadowDom(id);
        bind();
      }

    }
  };
});
