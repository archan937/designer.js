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

  getHTML = function() {
    var
      doc = document.implementation.createHTMLDocument(),
      html = $(doc.body.parentNode),
      options = {
        'tidy-mark': false,
        'hide-comments': true,
        'clean': true,
        'css-prefix': 'el',
        'indent': true,
        'indent-spaces': 2,
        'quiet': true,
        'show-warnings': true
      };

    Elements.deselectElement();
    html.html(document.body.parentNode.innerHTML);
    html.find('[id^=ds-]').remove();
    html.find('.ds-el').removeClass(/^ds-/).removeAttr(/^ds-/);

    return tidy_html5(html.html(), options);
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
          alert(getHTML());
          break;
      }

      // if (li.hasClass('move')) {
      //   // move toolbar
      // }
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
