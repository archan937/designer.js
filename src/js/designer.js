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

  registerCSS(@@designerCSS, 'ds-css');
  registerHTML(@@designerHTML);
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

},
  'Introspect',
  'Collections',
  'Events',
  'Inject',
  'Config',
  'Designer.Toolbar'
);

}
