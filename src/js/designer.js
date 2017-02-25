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

Designer = define(function() {

  registerJS(@@tidyJS, 'ds-js-tidy');
  registerCSS(@@fontAwesomeCSS, 'ds-css-fontawesome');
  registerCSS(@@toolbarCSS, 'ds-css-toolbar');
  registerCSS(@@elementsCSS, 'ds-css-designer');
  registerHTML(@@toolbarHTML);
  registerConfig(Toolbar.config);

  ready(function() {
    $(script.el).attr('id', 'ds-js-designer');
    injectCode();
    configure();
    Draggable.ready();
    Elements.ready();
    Toolbar.ready();
  });

  return {
    version: '{version}',
    $: $,
    show: Toolbar.show,
    hide: Toolbar.hide
  };

},
  'Utils',
  'Introspect',
  'Collections',
  'Elements',
  'Events',
  'Draggable',
  'Inject',
  'Config',
  'Designer.Toolbar',
  'Designer.Elements'
);

}
