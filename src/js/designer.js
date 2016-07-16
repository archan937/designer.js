if (typeof(Designer) == 'undefined') {

// *
// * designer.js {version} (Uncompressed)
// * A minimalistic Javascript library to design a web pages using absolute positioning
// *
// * (c) {year} Paul Engel
// * designer.js is licensed under MIT license
// *
// * $Date: {date} $
// *

Designer = (function() {

  mod.extend(this, 'Introspect');
  mod.extend(this, 'Collections');
  mod.extend(this, 'Elements');
  mod.extend(this, 'Events');
  mod.extend(this, 'Inject');
  mod.extend(this, 'Config');

  // mod.extend(this, 'Designer.Foo');

  registerCSS(@@designerCSS);

  injectCode();

  ready(function() {
    configure();
  });

  return {
    version: '{version}',
    $: $
  }
})();

}
