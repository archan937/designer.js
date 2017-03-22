mod.define('Designer.Toolbar', function() {
  var

  bind = function() {
    $('#ds-toolbar').on('a', 'click', function(e, target) {

      var
        li = $(target).closest('li'),
        type = li.attr('data-type').toLowerCase(),
        iframe = $('iframe.designer')[0],
        Designer = iframe ? iframe.contentWindow.Designer : undefined;

      if (!Designer) return;

      switch (type) {
        case 'text': case 'image':
          Designer.addElement(type);
          break;
        case 'background':
          Designer.editBackground();
          break;
        case 'backward':
          Designer.backward();
          break;
        case 'forward':
          Designer.forward();
          break;
        case 'html':
          alert(Designer.getHTML());
          break;
      }

    });
  };

  return {
    Toolbar: {
      ready: function() {
        bind();
      }
    }
  };
});
