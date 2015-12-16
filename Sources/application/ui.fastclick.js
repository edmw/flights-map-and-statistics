var $ = require('jquery'); var jQuery = $;

(function($) {
    'use strict';

    $.fn.fastClick = function(handler) {
        return $(this).each(function() {
            $.FastButton($(this)[0], handler);
        });
    };

    $.FastButton = function(element, handler) {
        var startX;
        var startY;

        var reset = function() {
            $(element).unbind('touchend');
            $('body').unbind('touchmove.fastClick');
        };

        var onClick = function(event) {
            event.stopPropagation();
            reset();
            handler.call(this, event);

            if (event.type === 'touchend') {
                $.clickbuster.preventGhostClick(startX, startY);
            }
        };

        var onTouchMove = function(event) {
            var dx = Math.abs(
                event.originalEvent.touches[0].clientX - startX
            );
            var dy = Math.abs(
                event.originalEvent.touches[0].clientY - startY
            );
            if (dx > 10 || dy > 10) {
                reset();
            }
        };

        var onTouchStart = function(event) {
            event.stopPropagation();

            $(element).bind('touchend', onClick);
            $('body').bind('touchmove.fastClick', onTouchMove);

            startX = event.originalEvent.touches[0].clientX;
            startY = event.originalEvent.touches[0].clientY;
        };

        $(element).bind({
            touchstart: onTouchStart,
            click: onClick
        });
    };

    $.clickbuster = {
        coordinates: [],

        preventGhostClick: function(x, y) {
            $.clickbuster.coordinates.push(x, y);
            window.setTimeout($.clickbuster.pop, 2500);
        },

        pop: function() {
            $.clickbuster.coordinates.splice(0, 2);
        },

        onClick: function(event) {
            var x;
            var y;
            var i;
            for (i = 0; i < $.clickbuster.coordinates.length; i += 2) {
                x = $.clickbuster.coordinates[i];
                y = $.clickbuster.coordinates[i + 1];
                var dx = Math.abs(event.clientX - x);
                var dy = Math.abs(event.clientY - y);
                if (dx < 25 && dy < 25) {
                    event.stopPropagation();
                    event.preventDefault();
                }
            }
        }
    };

    $(function() {
        if (document.addEventListener) {
            document.addEventListener('click', $.clickbuster.onClick, true);
        } else if (document.attachEvent) {
            document.attachEvent('onclick', $.clickbuster.onClick);
        }
    });

}(jQuery));
