(function() {
    'use strict';

    // stores the y position where a touch started
    var startY = 0;

    var handleTouchmove = function(evt) {
        var el = evt.target;

        // check all parent elements for scrollability
        while (el !== document.body) {
            var style = window.getComputedStyle(el);

            var scrolling = style.getPropertyValue(
                '-webkit-overflow-scrolling'
            );
            var overflow = style.getPropertyValue(
                'overflow'
            );
            var height = parseInt(style.getPropertyValue('height'), 10);

            var isScrollable = (scrolling === 'touch' && overflow === 'auto');
            var canScroll = (el.scrollHeight > el.offsetHeight);

            if (isScrollable && canScroll) {
                // get the current y position of the touch
                var currentY;
                if (evt.touches) {
                    currentY = evt.touches[0].screenY;
                }
                else {
                    currentY = evt.screenY;
                }

                // determine if the user is trying to scroll past the top or
                // bottom. in this case, the window will bounce, so we have
                // to prevent scrolling completely

                var isAtTop = (
                    (startY <= currentY) &&
                        (el.scrollTop === 0)
                );
                var isAtBottom = (
                    (startY >= currentY) &&
                        ((el.scrollHeight - el.scrollTop) === height)
                );

                if (isAtTop || isAtBottom) {
                    evt.preventDefault();
                }

                return;
            }

            el = el.parentNode;
        }

        evt.preventDefault();
    };

    var handleTouchstart = function(evt) {
        // store the first y position of the touch
        startY = evt.touches ? evt.touches[0].screenY : evt.screenY;
    };

    var enable = function() {
        window.addEventListener('touchstart', handleTouchstart, false);
        window.addEventListener('touchmove', handleTouchmove, false);
    };

    var disable = function() {
        window.removeEventListener('touchstart', handleTouchstart, false);
        window.removeEventListener('touchmove', handleTouchmove, false);
    };

    var scrollSupport = window.getComputedStyle(
        document.createElement('div')
    )['-webkit-overflow-scrolling'];
    if (typeof scrollSupport !== 'undefined') {
        enable();
    }
}());
