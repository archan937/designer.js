mod.define('Designer.Iframe', function() {
  var

  init = function(url) {
    url || (url = window.location.search.replace(/^\?/, ''));

    if (!url) return;

    var
      iframe = $('<iframe>'),
      iframeWindow,
      iframeDocument,
      timestamp = (url.match(/\?\w+/) ? '&' : '?') + 't=' + (new Date()).getTime();

    iframe.addClass('designer')
          .appendTo('body');

    iframeWindow = iframe[0].contentWindow;

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
      init: init
    }
  };
});
