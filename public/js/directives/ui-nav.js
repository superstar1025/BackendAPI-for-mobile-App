angular.module('app')
  .directive('uiNav', ['$timeout', function($timeout) {
    return {
      restrict: 'AC',
      link: function(scope, el, attr) {
        var _window = $(window);
        var _mb = 768;
        var wrap = $('.app-aside');
        var next;
        var backdrop = '.dropdown-backdrop';
        // unfolded
        el.on('click', 'a', function(e) {
          next && next.trigger('mouseleave.nav');
          var _this = $(this);
          _this.parent().siblings('.active').toggleClass('active');
          _this.next().is('ul') && _this.parent().toggleClass('active') && e.preventDefault();
          // mobile
          _this.next().is('ul') || ((_window.width() < _mb) && $('.app-aside').removeClass('show off-screen'));
        });

        // folded & fixed
        el.on('mouseenter', 'a', function(e) {
          next && next.trigger('mouseleave.nav');
          $('> .nav', wrap).remove();
          if (!$('.app-aside-fixed.app-aside-folded').length ||
            (_window.width() < _mb) ||
            $('.app-aside-dock').length) {
            return;
          }
          var _this = $(e.target);
          var top;
          var wH = $(window).height();
          var offset = 50;
          var min = 150;

          !_this.is('a') && (_this = _this.closest('a'));
          if (_this.next().is('ul')) {
            next = _this.next();
          } else {
            return;
          }

          _this.parent().addClass('active');
          top = _this.parent().position().top + offset;
          next.css('top', top);
          if (top + next.height() > wH) {
            next.css('bottom', 0);
          }
          if (top + min > wH) {
            next.css('bottom', wH - top - offset).css('top', 'auto');
          }
          next.appendTo(wrap);

          next.on('mouseleave.nav', function(e) {
            $(backdrop).remove();
            next.appendTo(_this.parent());
            next.off('mouseleave.nav').css('top', 'auto').css('bottom', 'auto');
            _this.parent().removeClass('active');
          });

          $('.smart').length && $('<div class="dropdown-backdrop"/>').insertAfter('.app-aside')
            .on('click', function(next) {
              next && next.trigger('mouseleave.nav');
            });

        });

        wrap.on('mouseleave', function(e) {
          next && next.trigger('mouseleave.nav');
          $('> .nav', wrap).remove();
        });
      }
    };
  }]);
