mod.define('Designer.Editor', function() {
  var

  bind = function() {
    $('#ds-editor .header').draggable({
      start: function() {
        $('body').append('<div class="ds-overlay"></div>');
      },
      move: function(e, el, position) {
        var
          editor = el.parent(),
          bounds = editor.bounds();

        editor.css({
          top: (bounds.top + parseInt(position.top)) + 'px',
          left: (bounds.left + parseInt(position.left)) + 'px',
          right: 'auto',
          bottom: 'auto'
        });

        delete position.top;
        delete position.left;
      },
      stop: function() {
        $('.ds-overlay').remove();
      }
    });

    // $('#ds-editor').on('a', 'click', function(e, target) {
    //
    //   var
    //     iframe = $('iframe.designer')[0],
    //     Designer = iframe ? iframe.contentWindow.Designer : undefined;
    //
    //   if (!Designer) return;
    //
    //   switch (type) {
    //     case 'text': case 'image':
    //       Designer.addElement(type);
    //       break;
    //   }
    //
    // });
  };

  return {
    Editor: {
      ready: function() {
        bind();
      }
    }
  };
});
