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
