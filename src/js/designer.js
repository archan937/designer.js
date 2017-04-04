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
        registerCSS(@@fontAwesomeCSS);
        registerCSS(@@iframeCSS);
        registerCSS(@@toolbarCSS);
        registerCSS(@@editorCSS);
        registerHTML(@@toolbarHTML);
        registerHTML(@@editorHTML);
        injectCode();
        Iframe.init(url);
        Toolbar.ready();
        Editor.ready();
      });
    },

    edit = function() {
      ready(function() {
        registerJS(@@tidyJS, 'ds-tidy');
        registerCSS(@@elementsCSS, 'ds-elements');
        injectCode();
        Elements.ready();
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
      html.find('[id="designer.js"]').remove();
      html.find('[id^=ds-]').remove();
      html.find('.ds-el').removeClass(/^ds-/).removeAttr(/^ds-/);
      return tidy_html5(html.html(), options);
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
    addElement: Elements.addElement,
    editBackground: Elements.editBackground,
    backward: backward,
    forward: forward,
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
  'Designer.Editor',
  'Designer.Elements'
);

}
