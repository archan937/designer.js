mod.define('Designer.Iframe', function() {
  var

  init = function(url) {
    url || (url = window.location.search.replace(/^\?/, ''));

    if (url) {
      $('<iframe>').addClass('designer').appendTo('body');
      load(url);
    }
  },

  load = function(url) {
    var
      iframe = $('iframe'),
      iframeWindow = iframe[0].contentWindow,
      iframeDocument,
      timestamp = (url.match(/\?\w+/) ? '&' : '?') + 't=' + (new Date()).getTime();

    iframe.bind('load', function() {
      if (iframeWindow.location.href.indexOf(timestamp) != -1) {
        iframeDocument = iframeWindow.document;

        var el = iframeDocument.createElement('script');
        el.id = 'designer.js';
        el.src = script.src + '?edit';

        iframeDocument.body.appendChild(el);
        iframe.focus();
      }
    });

    iframeDocument = iframeWindow.document;
    iframeDocument.open();
    iframeDocument.write('<body onload="window.location.replace(\'' + url + timestamp + '\')">');
    iframeDocument.close();
  };

  return {
    Iframe: {
      init: init,
      load: load
    }
  };
});
