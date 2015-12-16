(function() {
    'use strict';

    var $ = require('jquery'); var jQuery = $;

    function setup($) {

        $.showModal = function(opts) { show(window, opts); };
        $.hideModal = function(opts) { hide(window, opts); };

        $.fn.addModalBlock = function(opts) {
            if (this[0] === window) {
                $.showModal(opts);
                return this;
            }
            return this.each(function() {
                $(this).removeModalBlock({fadeOut: 0});
                show(this, opts);
            });
        };

        $.fn.removeModalBlock = function(opts) {
            if (this[0] === window) {
                $.hideModal(opts);
                return this;
            }
            return this.each(function() {
                if ($.css(this, 'position') === 'static') {
                    this.style.position = 'relative';
                    $(this).data('modal.static', true);
                }
                hide(this, opts);
            });
        };

        $.showModal.defaults = {
            message: null,

            onclick: null,

            // fade in time in milliseconds; set to 0 to disable
            fadein: 200,
            // fade out time in milliseconds; set to 0 to disable
            fadeout: 200,

            // time in milliseconds to wait before unblocking
            delay: 0,

            cssContent: {
                margin: '0',
                left: '1em',
                top: '1em',
                right: '1em',
            },
            cssOverlay:  {
                backgroundColor: '#000',
                opacity: '0.6',
            },
        };

        var events = [
            'mousedown',
            'mouseup',
            'keydown',
            'keypress',
            'keyup',
            'touchstart',
            'touchend',
            'touchmove',
         ].join(' ');

        function show(el, opts) {
            opts = $.extend({}, $.showModal.defaults, opts || {});

            var full = (el === window);
            var message = (opts && opts.message) ? opts.message : undefined;
            var onclick = (opts && opts.onclick) ? opts.onclick : undefined;
            var fadein = (opts && opts.fadein) ? opts.fadein : 0;

            // nothing to do if element is blocked already
            if ($(el).data('modal.blocked')) {
                return;
            }

            // overlay
            var overlay = $('<div>', {
                'class': 'modal modal-overlay',
            });
            overlay.css({
                'z-index': '1000',
                'display': 'block',
                'border': 'none',
                'margin': '0',
                'padding': '0',
                'width': '100%',
                'height': '100%',
                'top': '0',
                'left': '0',
                'position': (full ? 'fixed' : 'absolute'),
                'cursor': 'wait',
            });
            overlay.css(opts.cssOverlay);

            // content
            var content = null;
            if (message) {
                content = $('<div>', {
                    'class': 'modal content ' +
                        (full ? 'modal-page' : 'modal-element'),
                });
                content.css({
                    'z-index': '1000',
                    'display': 'block',
                    'position': (full ? 'fixed' : 'absolute'),
                    'cursor': (onclick ? 'pointer' : 'wait'),
                });
                content.css(opts.cssContent);

                content.append(message);

                if (typeof onclick !== 'undefined') {
                    content.fastClick(onclick);
                }
            }

            bind(el, opts);

            var wrapper = $('<div>', {'class': 'modal-wrapper'});
            wrapper.css({
                'display': 'none',
            });
            if (overlay) {
                wrapper.append(overlay);
            }
            if (content) {
                wrapper.append(content);
            }
            wrapper.appendTo(full ? $('body') : $(el));

            if (fadein > 0) {
                wrapper.stop().fadeIn(fadein);
            }
            else {
                wrapper.show();
            }

            $(el).data('modal.blocked', 1);
        }

        function hide(el, opts) {
            opts = $.extend({}, $.showModal.defaults, opts || {});

            var full = (el === window);
            var delay = (opts && opts.delay) ? opts.delay : 0;

            // nothing to do if element is not blocked
            if (!$(el).data('modal.blocked')) {
                return;
            }

            var $e = full ? $('body') : $(el);
            var wrapper = $e.find('>.modal-wrapper');

            if (delay > 0) {
                window.setTimeout(function() {
                    hideLayers(wrapper, opts);
                }, opts.delay);
            }
            else {
                hideLayers(wrapper, opts);
            }

            unbind(el);

            $(el).data('modal.blocked', 0);
        }

        function hideLayers(wrapper, opts) {

            function removeLayers(wrapper) {
                if (wrapper.parentNode) {
                    wrapper.parentNode.removeChild(wrapper);
                }
            }

            var fadeout = (opts && opts.fadeout) ? opts.fadeout : 0;

            if (fadeout > 0) {
                wrapper.stop().fadeOut(fadeout, function() {
                    removeLayers(wrapper);
                });
            }
            else {
                wrapper.hide();
                removeLayers(wrapper);
            }
        }

        function bind(el, opts) {
            // nothing to do if events are blocked already
            if (!$(el).data('modal.blocked.events')) {
                return;
            }

            $(document).bind(events, opts, handler);

            $(el).data('modal.blocked.events', 1);
        }

        function unbind(el) {
            // nothing to do if events are not blocked
            if (!$(el).data('modal.blocked.events')) {
                return;
            }

            $(document).unbind(events, handler);

            $(el).data('modal.blocked.events', 0);
        }

        function handler(e) {
            /* var opts = e.data; */
            var target = $(e.target);

            // allow events on message layer
            if (target.hasClass('modal-wrapper')) {
                return true;
            }
            // allow events for content not being blocked
            var div = target.parents().children().filter('div.modal-wrapper');
            if (div.length === 0) {
                return true;
            }
            return false;
        }

    }

    setup(jQuery);
})();
