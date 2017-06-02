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
        registerHTML(@@toolbarHTML);
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
        registerCSS(@@elementsCSS, 'ds-elements');
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
