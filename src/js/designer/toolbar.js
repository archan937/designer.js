mod.define('Designer.Toolbar', function() {
  var

  shadowDomId = 'ds-shadow-dom',
  toolbarId = 'ds-toolbar',

  shadowDomSelector = '#' + shadowDomId,
  toolbarSelector = '#' + toolbarId,

  el = function() {
    var shadowDom = $(shadowDomSelector)[0],
        el = [];

    if (shadowDom) {
      el = $(toolbarSelector, shadowDom.shadowRoot);
    }

    return el.length ? el : $(toolbarSelector);
  },

  show = function() {
    el().show();
  },

  hide = function() {
    el().hide();
  },

  bind = function() {
    el().on('a', 'click', function(e, target) {
      var
        li = $(target).closest('li'),
        type = li.attr('data-type').toLowerCase();

      switch (type) {
        case 'text': case 'image':
          Elements.addElement(type);
          break;
        case 'background':
          Elements.editBackground();
          break;
        case 'back':
          $('.ds-selected').backward('.ds-el');
          e.stopPropagation();
          break;
        case 'front':
          $('.ds-selected').forward('.ds-el');
          e.stopPropagation();
          break;
        case 'code':
          Elements.deselectElement();
          html = $('<div>' + $('body').html() + '</div>');
          // html.find('#ds-shadow-dom').remove();
          // html.find('.ds-*').css({background: 'red'});
          // alert(html.html());
          break;
      }

      if (li.hasClass('move')) {
        // move toolbar
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
        $('#ds-css-fontawesome').toShadowDom(shadowDomId);
        $('#ds-css-toolbar').toShadowDom(shadowDomId);
        el().toShadowDom(shadowDomId);
        bind();
      }

    }
  };
});
