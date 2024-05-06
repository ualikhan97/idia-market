if (typeof jQuery === 'undefined') {
    throw new Error("Bootstrap's JavaScript requires jQuery");
}

/* ======================================================================== */

+(function ($) {
    'use strict';
    var version = $.fn.jquery.split(' ')[0].split('.');
    if (
        (version[0] < 2 && version[1] < 9) ||
        (version[0] == 1 && version[1] == 9 && version[2] < 1)
    ) {
        throw new Error("Bootstrap's JavaScript requires jQuery version 1.9.1 or higher");
    }
})(jQuery);

/* ======================================================================== */

+(function ($) {
    'use strict';

    // CSS TRANSITION SUPPORT (https://www.modernizr.com/)

    function transitionEnd() {
        var el = document.createElement('bootstrap');

        var transEndEventNames = {
            WebkitTransition: 'webkitTransitionEnd',
            MozTransition: 'transitionend',
            OTransition: 'oTransitionEnd otransitionend',
            transition: 'transitionend',
        };

        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return {end: transEndEventNames[name]};
            }
        }

        return false;
    }

    $.fn.emulateTransitionEnd = function (duration) {
        var called = false;
        var $el = this;
        $(this).one('bsTransitionEnd', function () {
            called = true;
        });
        var callback = function () {
            if (!called) $($el).trigger($.support.transition.end);
        };
        setTimeout(callback, duration);
        return this;
    };

    $(function () {
        $.support.transition = transitionEnd();

        if (!$.support.transition) return;

        $.event.special.bsTransitionEnd = {
            bindType: $.support.transition.end,
            delegateType: $.support.transition.end,
            handle: function (e) {
                if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments);
            },
        };
    });
})(jQuery);

/* ======================================================================== */

+(function ($) {
    'use strict';

    // ALERT CLASS DEFINITION

    var dismiss = '[data-dismiss="alert"]';
    var Alert = function (el) {
        $(el).on('click', dismiss, this.close);
    };

    Alert.VERSION = '3.3.4';

    Alert.TRANSITION_DURATION = 150;

    Alert.prototype.close = function (e) {
        var $this = $(this);
        var selector = $this.attr('data-target');

        if (!selector) {
            selector = $this.attr('href');
            selector = selector && selector.replace(/.*(?=#[^\s]*$)/, ''); // strip for ie7
        }

        var $parent = $(selector);

        if (e) e.preventDefault();

        if (!$parent.length) {
            $parent = $this.closest('.alert');
        }

        $parent.trigger((e = $.Event('close.bs.alert')));

        if (e.isDefaultPrevented()) return;

        $parent.removeClass('in');

        function removeElement() {
            // detach from parent, fire event then clean up data
            $parent.detach().trigger('closed.bs.alert').remove();
        }

        $.support.transition && $parent.hasClass('fade')
            ? $parent
                .one('bsTransitionEnd', removeElement)
                .emulateTransitionEnd(Alert.TRANSITION_DURATION)
            : removeElement();
    };

    // ALERT PLUGIN DEFINITION

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('bs.alert');

            if (!data) $this.data('bs.alert', (data = new Alert(this)));
            if (typeof option == 'string') data[option].call($this);
        });
    }

    var old = $.fn.alert;

    $.fn.alert = Plugin;
    $.fn.alert.Constructor = Alert;

    // ALERT NO CONFLICT
    // =================

    $.fn.alert.noConflict = function () {
        $.fn.alert = old;
        return this;
    };

    // ALERT DATA-API
    // ==============

    $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close);
})(jQuery);

/* ======================================================================== */

+(function ($) {
    'use strict';

    // BUTTON PUBLIC CLASS DEFINITION
    // ==============================

    var Button = function (element, options) {
        this.$element = $(element);
        this.options = $.extend({}, Button.DEFAULTS, options);
        this.isLoading = false;
    };

    Button.VERSION = '3.3.4';

    Button.DEFAULTS = {
        loadingText: 'loading...',
    };

    Button.prototype.setState = function (state) {
        var d = 'disabled';
        var $el = this.$element;
        var val = $el.is('input') ? 'val' : 'html';
        var data = $el.data();

        state = state + 'Text';

        if (data.resetText == null) $el.data('resetText', $el[val]());

        // push to event loop to allow forms to submit
        setTimeout(
            $.proxy(function () {
                $el[val](data[state] == null ? this.options[state] : data[state]);

                if (state == 'loadingText') {
                    this.isLoading = true;
                    $el.addClass(d).attr(d, d);
                } else if (this.isLoading) {
                    this.isLoading = false;
                    $el.removeClass(d).removeAttr(d);
                }
            }, this),
            0,
        );
    };

    Button.prototype.toggle = function () {
        var changed = true;
        var $parent = this.$element.closest('[data-toggle="buttons"]');

        if ($parent.length) {
            var $input = this.$element.find('input');
            if ($input.prop('type') == 'radio') {
                if ($input.prop('checked') && this.$element.hasClass('active')) changed = false;
                else $parent.find('.active').removeClass('active');
            }
            if (changed) $input.prop('checked', !this.$element.hasClass('active')).trigger('change');
        } else {
            this.$element.attr('aria-pressed', !this.$element.hasClass('active'));
        }

        if (changed) this.$element.toggleClass('active');
    };

    // BUTTON PLUGIN DEFINITION
    // ========================

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('bs.button');
            var options = typeof option == 'object' && option;

            if (!data) $this.data('bs.button', (data = new Button(this, options)));

            if (option == 'toggle') data.toggle();
            else if (option) data.setState(option);
        });
    }

    var old = $.fn.button;

    $.fn.button = Plugin;
    $.fn.button.Constructor = Button;

    // BUTTON NO CONFLICT
    // ==================

    $.fn.button.noConflict = function () {
        $.fn.button = old;
        return this;
    };

    // BUTTON DATA-API
    // ===============

    $(document)
        .on('click.bs.button.data-api', '[data-toggle^="button"]', function (e) {
            var $btn = $(e.target);
            if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn');
            Plugin.call($btn, 'toggle');
            e.preventDefault();
        })
        .on(
            'focus.bs.button.data-api blur.bs.button.data-api',
            '[data-toggle^="button"]',
            function (e) {
                $(e.target)
                    .closest('.btn')
                    .toggleClass('focus', /^focus(in)?$/.test(e.type));
            },
        );
})(jQuery);

/* ======================================================================== */

+(function ($) {
    'use strict';

    // CAROUSEL CLASS DEFINITION
    // =========================

    var Carousel = function (element, options) {
        this.$element = $(element);
        this.$indicators = this.$element.find('.carousel-indicators');
        this.options = options;
        this.paused = null;
        this.sliding = null;
        this.interval = null;
        this.$active = null;
        this.$items = null;

        this.options.keyboard && this.$element.on('keydown.bs.carousel', $.proxy(this.keydown, this));

        this.options.pause == 'hover' &&
        !('ontouchstart' in document.documentElement) &&
        this.$element
            .on('mouseenter.bs.carousel', $.proxy(this.pause, this))
            .on('mouseleave.bs.carousel', $.proxy(this.cycle, this));
    };

    Carousel.VERSION = '3.3.4';

    Carousel.TRANSITION_DURATION = 600;

    Carousel.DEFAULTS = {
        interval: 3000,
        pause: 'hover',
        wrap: true,
        keyboard: true,
    };

    Carousel.prototype.keydown = function (e) {
        if (/input|textarea/i.test(e.target.tagName)) return;
        switch (e.which) {
            case 37:
                this.prev();
                break;
            case 39:
                this.next();
                break;
            default:
                return;
        }

        e.preventDefault();
    };

    Carousel.prototype.cycle = function (e) {
        e || (this.paused = false);

        this.interval && clearInterval(this.interval);

        this.options.interval &&
        !this.paused &&
        (this.interval = setInterval($.proxy(this.next, this), this.options.interval));

        return this;
    };

    Carousel.prototype.getItemIndex = function (item) {
        this.$items = item.parent().children('.item');
        return this.$items.index(item || this.$active);
    };

    Carousel.prototype.getItemForDirection = function (direction, active) {
        var activeIndex = this.getItemIndex(active);
        var willWrap =
            (direction == 'prev' && activeIndex === 0) ||
            (direction == 'next' && activeIndex == this.$items.length - 1);
        if (willWrap && !this.options.wrap) return active;
        var delta = direction == 'prev' ? -1 : 1;
        var itemIndex = (activeIndex + delta) % this.$items.length;
        return this.$items.eq(itemIndex);
    };

    Carousel.prototype.to = function (pos) {
        var that = this;
        var activeIndex = this.getItemIndex((this.$active = this.$element.find('.item.active')));

        if (pos > this.$items.length - 1 || pos < 0) return;

        if (this.sliding)
            return this.$element.one('slid.bs.carousel', function () {
                that.to(pos);
            }); // yes, "slid"
        if (activeIndex == pos) return this.pause().cycle();

        return this.slide(pos > activeIndex ? 'next' : 'prev', this.$items.eq(pos));
    };

    Carousel.prototype.pause = function (e) {
        e || (this.paused = true);

        if (this.$element.find('.next, .prev').length && $.support.transition) {
            this.$element.trigger($.support.transition.end);
            this.cycle(true);
        }

        this.interval = clearInterval(this.interval);

        return this;
    };

    Carousel.prototype.next = function () {
        if (this.sliding) return;
        return this.slide('next');
    };

    Carousel.prototype.prev = function () {
        if (this.sliding) return;
        return this.slide('prev');
    };

    Carousel.prototype.slide = function (type, next) {
        var $active = this.$element.find('.item.active');
        var $next = next || this.getItemForDirection(type, $active);
        var isCycling = this.interval;
        var direction = type == 'next' ? 'left' : 'right';
        var that = this;

        if ($next.hasClass('active')) return (this.sliding = false);

        var relatedTarget = $next[0];
        var slideEvent = $.Event('slide.bs.carousel', {
            relatedTarget: relatedTarget,
            direction: direction,
        });
        this.$element.trigger(slideEvent);
        if (slideEvent.isDefaultPrevented()) return;

        this.sliding = true;

        isCycling && this.pause();

        if (this.$indicators.length) {
            this.$indicators.find('.active').removeClass('active');
            var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)]);
            $nextIndicator && $nextIndicator.addClass('active');
        }

        var slidEvent = $.Event('slid.bs.carousel', {
            relatedTarget: relatedTarget,
            direction: direction,
        }); // yes, "slid"
        if ($.support.transition && this.$element.hasClass('slide')) {
            $next.addClass(type);
            $next[0].offsetWidth; // force reflow
            $active.addClass(direction);
            $next.addClass(direction);
            $active
                .one('bsTransitionEnd', function () {
                    $next.removeClass([type, direction].join(' ')).addClass('active');
                    $active.removeClass(['active', direction].join(' '));
                    that.sliding = false;
                    setTimeout(function () {
                        that.$element.trigger(slidEvent);
                    }, 0);
                })
                .emulateTransitionEnd(Carousel.TRANSITION_DURATION);
        } else {
            $active.removeClass('active');
            $next.addClass('active');
            this.sliding = false;
            this.$element.trigger(slidEvent);
        }

        isCycling && this.cycle();

        return this;
    };

    // CAROUSEL PLUGIN DEFINITION
    // ==========================

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('bs.carousel');
            var options = $.extend(
                {},
                Carousel.DEFAULTS,
                $this.data(),
                typeof option == 'object' && option,
            );
            var action = typeof option == 'string' ? option : options.slide;

            if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)));
            if (typeof option == 'number') data.to(option);
            else if (action) data[action]();
            else if (options.interval) data.pause().cycle();
        });
    }

    var old = $.fn.carousel;

    $.fn.carousel = Plugin;
    $.fn.carousel.Constructor = Carousel;

    // CAROUSEL NO CONFLICT
    // ====================

    $.fn.carousel.noConflict = function () {
        $.fn.carousel = old;
        return this;
    };

    // CAROUSEL DATA-API
    // =================

    var clickHandler = function (e) {
        var href;
        var $this = $(this);
        var $target = $(
            $this.attr('data-target') ||
            ((href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')),
        ); // strip for ie7
        if (!$target.hasClass('carousel')) return;
        var options = $.extend({}, $target.data(), $this.data());
        var slideIndex = $this.attr('data-slide-to');
        if (slideIndex) options.interval = false;

        Plugin.call($target, options);

        if (slideIndex) {
            $target.data('bs.carousel').to(slideIndex);
        }

        e.preventDefault();
    };

    $(document)
        .on('click.bs.carousel.data-api', '[data-slide]', clickHandler)
        .on('click.bs.carousel.data-api', '[data-slide-to]', clickHandler);

    $(window).on('load', function () {
        $('[data-ride="carousel"]').each(function () {
            var $carousel = $(this);
            Plugin.call($carousel, $carousel.data());
        });
    });
})(jQuery);

/* ======================================================================== */

+(function ($) {
    'use strict';

    // COLLAPSE PUBLIC CLASS DEFINITION
    // ================================

    var Collapse = function (element, options) {
        this.$element = $(element);
        this.options = $.extend({}, Collapse.DEFAULTS, options);
        this.$trigger = $(
            '[data-toggle="collapse"][href="#' +
            element.id +
            '"],' +
            '[data-toggle="collapse"][data-target="#' +
            element.id +
            '"]',
        );
        this.transitioning = null;

        if (this.options.parent) {
            this.$parent = this.getParent();
        } else {
            this.addAriaAndCollapsedClass(this.$element, this.$trigger);
        }

        if (this.options.toggle) this.toggle();
    };

    Collapse.VERSION = '3.3.4';

    Collapse.TRANSITION_DURATION = 350;

    Collapse.DEFAULTS = {
        toggle: true,
    };

    Collapse.prototype.dimension = function () {
        var hasWidth = this.$element.hasClass('width');
        return hasWidth ? 'width' : 'height';
    };

    Collapse.prototype.show = function () {
        if (this.transitioning || this.$element.hasClass('in')) return;

        var activesData;
        var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing');

        if (actives && actives.length) {
            activesData = actives.data('bs.collapse');
            if (activesData && activesData.transitioning) return;
        }

        var startEvent = $.Event('show.bs.collapse');
        this.$element.trigger(startEvent);
        if (startEvent.isDefaultPrevented()) return;

        if (actives && actives.length) {
            Plugin.call(actives, 'hide');
            activesData || actives.data('bs.collapse', null);
        }

        var dimension = this.dimension();

        this.$element
            .removeClass('collapse')
            .addClass('collapsing')
            [dimension](0)
            .attr('aria-expanded', true);

        this.$trigger.removeClass('collapsed').attr('aria-expanded', true);

        this.transitioning = 1;

        var complete = function () {
            this.$element.removeClass('collapsing').addClass('collapse in')[dimension]('');
            this.transitioning = 0;
            this.$element.trigger('shown.bs.collapse');
        };

        if (!$.support.transition) return complete.call(this);

        var scrollSize = $.camelCase(['scroll', dimension].join('-'));

        this.$element
            .one('bsTransitionEnd', $.proxy(complete, this))
            .emulateTransitionEnd(Collapse.TRANSITION_DURATION)
            [dimension](this.$element[0][scrollSize]);
    };

    Collapse.prototype.hide = function () {
        if (this.transitioning || !this.$element.hasClass('in')) return;

        var startEvent = $.Event('hide.bs.collapse');
        this.$element.trigger(startEvent);
        if (startEvent.isDefaultPrevented()) return;

        var dimension = this.dimension();

        this.$element[dimension](this.$element[dimension]())[0].offsetHeight;

        this.$element.addClass('collapsing').removeClass('collapse in').attr('aria-expanded', false);

        this.$trigger.addClass('collapsed').attr('aria-expanded', false);

        this.transitioning = 1;

        var complete = function () {
            this.transitioning = 0;
            this.$element.removeClass('collapsing').addClass('collapse').trigger('hidden.bs.collapse');
        };

        if (!$.support.transition) return complete.call(this);

        this.$element[dimension](0)
            .one('bsTransitionEnd', $.proxy(complete, this))
            .emulateTransitionEnd(Collapse.TRANSITION_DURATION);
    };

    Collapse.prototype.toggle = function () {
        this[this.$element.hasClass('in') ? 'hide' : 'show']();
    };

    Collapse.prototype.getParent = function () {
        return $(this.options.parent)
            .find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]')
            .each(
                $.proxy(function (i, element) {
                    var $element = $(element);
                    this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element);
                }, this),
            )
            .end();
    };

    Collapse.prototype.addAriaAndCollapsedClass = function ($element, $trigger) {
        var isOpen = $element.hasClass('in');

        $element.attr('aria-expanded', isOpen);
        $trigger.toggleClass('collapsed', !isOpen).attr('aria-expanded', isOpen);
    };

    function getTargetFromTrigger($trigger) {
        var href;
        var target =
            $trigger.attr('data-target') ||
            ((href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')); // strip for ie7

        return $(target);
    }

    // COLLAPSE PLUGIN DEFINITION
    // ==========================

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('bs.collapse');
            var options = $.extend(
                {},
                Collapse.DEFAULTS,
                $this.data(),
                typeof option == 'object' && option,
            );

            if (!data && options.toggle && /show|hide/.test(option)) options.toggle = false;
            if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)));
            if (typeof option == 'string') data[option]();
        });
    }

    var old = $.fn.collapse;

    $.fn.collapse = Plugin;
    $.fn.collapse.Constructor = Collapse;

    // COLLAPSE NO CONFLICT
    // ====================

    $.fn.collapse.noConflict = function () {
        $.fn.collapse = old;
        return this;
    };

    // COLLAPSE DATA-API
    // =================

    $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
        var $this = $(this);

        if (!$this.attr('data-target')) e.preventDefault();

        var $target = getTargetFromTrigger($this);
        var data = $target.data('bs.collapse');
        var option = data ? 'toggle' : $this.data();

        Plugin.call($target, option);
    });
})(jQuery);

/* ======================================================================== */

+(function ($) {
    'use strict';

    // DROPDOWN CLASS DEFINITION
    // =========================

    var backdrop = '.dropdown-backdrop';
    var toggle = '[data-toggle="dropdown"]';
    var Dropdown = function (element) {
        $(element).on('click.bs.dropdown', this.toggle);
    };

    Dropdown.VERSION = '3.3.4';

    Dropdown.prototype.toggle = function (e) {
        var $this = $(this);

        if ($this.is('.disabled, :disabled')) return;

        var $parent = getParent($this);
        var isActive = $parent.hasClass('open');

        clearMenus();

        if (!isActive) {
            if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
                // if mobile we use a backdrop because click events don't delegate
                $('<div class="dropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus);
            }

            var relatedTarget = {relatedTarget: this};
            $parent.trigger((e = $.Event('show.bs.dropdown', relatedTarget)));

            if (e.isDefaultPrevented()) return;

            $this.trigger('focus').attr('aria-expanded', 'true');

            $parent.toggleClass('open').trigger('shown.bs.dropdown', relatedTarget);
        }

        return false;
    };

    Dropdown.prototype.keydown = function (e) {
        if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return;

        var $this = $(this);

        e.preventDefault();
        e.stopPropagation();

        if ($this.is('.disabled, :disabled')) return;

        var $parent = getParent($this);
        var isActive = $parent.hasClass('open');

        if ((!isActive && e.which != 27) || (isActive && e.which == 27)) {
            if (e.which == 27) $parent.find(toggle).trigger('focus');
            return $this.trigger('click');
        }

        var desc = ' li:not(.disabled):visible a';
        var $items = $parent.find('[role="menu"]' + desc + ', [role="listbox"]' + desc);

        if (!$items.length) return;

        var index = $items.index(e.target);

        if (e.which == 38 && index > 0) index--; // up
        if (e.which == 40 && index < $items.length - 1) index++; // down
        if (!~index) index = 0;

        $items.eq(index).trigger('focus');
    };

    function clearMenus(e) {
        if (e && e.which === 3) return;
        $(backdrop).remove();
        $(toggle).each(function () {
            var $this = $(this);
            var $parent = getParent($this);
            var relatedTarget = {relatedTarget: this};

            if (!$parent.hasClass('open')) return;

            $parent.trigger((e = $.Event('hide.bs.dropdown', relatedTarget)));

            if (e.isDefaultPrevented()) return;

            $this.attr('aria-expanded', 'false');
            $parent.removeClass('open').trigger('hidden.bs.dropdown', relatedTarget);
        });
    }

    function getParent($this) {
        var selector = $this.attr('data-target');

        if (!selector) {
            selector = $this.attr('href');
            selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, ''); // strip for ie7
        }

        var $parent = selector && $(selector);

        return $parent && $parent.length ? $parent : $this.parent();
    }

    // DROPDOWN PLUGIN DEFINITION
    // ==========================

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('bs.dropdown');

            if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)));
            if (typeof option == 'string') data[option].call($this);
        });
    }

    var old = $.fn.dropdown;

    $.fn.dropdown = Plugin;
    $.fn.dropdown.Constructor = Dropdown;

    // DROPDOWN NO CONFLICT
    // ====================

    $.fn.dropdown.noConflict = function () {
        $.fn.dropdown = old;
        return this;
    };

    // APPLY TO STANDARD DROPDOWN ELEMENTS
    // ===================================

    $(document)
        .on('click.bs.dropdown.data-api', clearMenus)
        .on('click.bs.dropdown.data-api', '.dropdown form', function (e) {
            e.stopPropagation();
        })
        .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
        .on('keydown.bs.dropdown.data-api', toggle, Dropdown.prototype.keydown)
        .on('keydown.bs.dropdown.data-api', '[role="menu"]', Dropdown.prototype.keydown)
        .on('keydown.bs.dropdown.data-api', '[role="listbox"]', Dropdown.prototype.keydown);
})(jQuery);

/* ======================================================================== */

+(function ($) {
    'use strict';

    // MODAL CLASS DEFINITION
    // ======================

    var Modal = function (element, options) {
        this.options = options;
        this.$body = $(document.body);
        this.$element = $(element);
        this.$dialog = this.$element.find('.modal-dialog');
        this.$backdrop = null;
        this.isShown = null;
        this.originalBodyPad = null;
        this.scrollbarWidth = 0;
        this.ignoreBackdropClick = false;

        if (this.options.remote) {
            this.$element.find('.modal-content').load(
                this.options.remote,
                $.proxy(function () {
                    this.$element.trigger('loaded.bs.modal');
                }, this),
            );
        }
    };

    Modal.VERSION = '3.3.4';

    Modal.TRANSITION_DURATION = 300;
    Modal.BACKDROP_TRANSITION_DURATION = 150;

    Modal.DEFAULTS = {
        backdrop: true,
        keyboard: true,
        show: true,
    };

    Modal.prototype.toggle = function (_relatedTarget) {
        return this.isShown ? this.hide() : this.show(_relatedTarget);
    };

    Modal.prototype.show = function (_relatedTarget) {
        var that = this;
        var e = $.Event('show.bs.modal', {relatedTarget: _relatedTarget});

        this.$element.trigger(e);

        if (this.isShown || e.isDefaultPrevented()) return;

        this.isShown = true;

        this.checkScrollbar();
        this.setScrollbar();
        this.$body.addClass('modal-open');

        this.escape();
        this.resize();

        this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this));

        this.$dialog.on('mousedown.dismiss.bs.modal', function () {
            that.$element.one('mouseup.dismiss.bs.modal', function (e) {
                if ($(e.target).is(that.$element)) that.ignoreBackdropClick = true;
            });
        });

        this.backdrop(function () {
            var transition = $.support.transition && that.$element.hasClass('fade');

            if (!that.$element.parent().length) {
                that.$element.appendTo(that.$body); // don't move modals dom position
            }

            that.$element.show().scrollTop(0);

            that.adjustDialog();

            if (transition) {
                that.$element[0].offsetWidth; // force reflow
            }

            that.$element.addClass('in').attr('aria-hidden', false);

            that.enforceFocus();

            var e = $.Event('shown.bs.modal', {relatedTarget: _relatedTarget});

            transition
                ? that.$dialog // wait for modal to slide in
                    .one('bsTransitionEnd', function () {
                        that.$element.trigger('focus').trigger(e);
                    })
                    .emulateTransitionEnd(Modal.TRANSITION_DURATION)
                : that.$element.trigger('focus').trigger(e);
        });
    };

    Modal.prototype.hide = function (e) {
        if (e) e.preventDefault();

        e = $.Event('hide.bs.modal');

        this.$element.trigger(e);

        if (!this.isShown || e.isDefaultPrevented()) return;

        this.isShown = false;

        this.escape();
        this.resize();

        $(document).off('focusin.bs.modal');

        this.$element
            .removeClass('in')
            .attr('aria-hidden', true)
            .off('click.dismiss.bs.modal')
            .off('mouseup.dismiss.bs.modal');

        this.$dialog.off('mousedown.dismiss.bs.modal');

        $.support.transition && this.$element.hasClass('fade')
            ? this.$element
                .one('bsTransitionEnd', $.proxy(this.hideModal, this))
                .emulateTransitionEnd(Modal.TRANSITION_DURATION)
            : this.hideModal();
    };

    Modal.prototype.enforceFocus = function () {
        $(document)
            .off('focusin.bs.modal') // guard against infinite focus loop
            .on(
                'focusin.bs.modal',
                $.proxy(function (e) {
                    if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
                        this.$element.trigger('focus');
                    }
                }, this),
            );
    };

    Modal.prototype.escape = function () {
        if (this.isShown && this.options.keyboard) {
            this.$element.on(
                'keydown.dismiss.bs.modal',
                $.proxy(function (e) {
                    e.which == 27 && this.hide();
                }, this),
            );
        } else if (!this.isShown) {
            this.$element.off('keydown.dismiss.bs.modal');
        }
    };

    Modal.prototype.resize = function () {
        if (this.isShown) {
            $(window).on('resize.bs.modal', $.proxy(this.handleUpdate, this));
        } else {
            $(window).off('resize.bs.modal');
        }
    };

    Modal.prototype.hideModal = function () {
        var that = this;
        this.$element.hide();
        this.backdrop(function () {
            that.$body.removeClass('modal-open');
            that.resetAdjustments();
            that.resetScrollbar();
            that.$element.trigger('hidden.bs.modal');
        });
    };

    Modal.prototype.removeBackdrop = function () {
        this.$backdrop && this.$backdrop.remove();
        this.$backdrop = null;
    };

    Modal.prototype.backdrop = function (callback) {
        var that = this;
        var animate = this.$element.hasClass('fade') ? 'fade' : '';

        if (this.isShown && this.options.backdrop) {
            var doAnimate = $.support.transition && animate;

            this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />').appendTo(this.$body);

            this.$element.on(
                'click.dismiss.bs.modal',
                $.proxy(function (e) {
                    if (this.ignoreBackdropClick) {
                        this.ignoreBackdropClick = false;
                        return;
                    }
                    if (e.target !== e.currentTarget) return;
                    this.options.backdrop == 'static' ? this.$element[0].focus() : this.hide();
                }, this),
            );

            if (doAnimate) this.$backdrop[0].offsetWidth; // force reflow

            this.$backdrop.addClass('in');

            if (!callback) return;

            doAnimate
                ? this.$backdrop
                    .one('bsTransitionEnd', callback)
                    .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION)
                : callback();
        } else if (!this.isShown && this.$backdrop) {
            this.$backdrop.removeClass('in');

            var callbackRemove = function () {
                that.removeBackdrop();
                callback && callback();
            };
            $.support.transition && this.$element.hasClass('fade')
                ? this.$backdrop
                    .one('bsTransitionEnd', callbackRemove)
                    .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION)
                : callbackRemove();
        } else if (callback) {
            callback();
        }
    };

    // these following methods are used to handle overflowing modals

    Modal.prototype.handleUpdate = function () {
        this.adjustDialog();
    };

    Modal.prototype.adjustDialog = function () {
        var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight;

        this.$element.css({
            paddingLeft: !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
            paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : '',
        });
    };

    Modal.prototype.resetAdjustments = function () {
        this.$element.css({
            paddingLeft: '',
            paddingRight: '',
        });
    };

    Modal.prototype.checkScrollbar = function () {
        var fullWindowWidth = window.innerWidth;
        if (!fullWindowWidth) {
            // workaround for missing window.innerWidth in IE8
            var documentElementRect = document.documentElement.getBoundingClientRect();
            fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left);
        }
        this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth;
        this.scrollbarWidth = this.measureScrollbar();
    };

    Modal.prototype.setScrollbar = function () {
        var bodyPad = parseInt(this.$body.css('padding-right') || 0, 10);
        this.originalBodyPad = document.body.style.paddingRight || '';
        if (this.bodyIsOverflowing) this.$body.css('padding-right', bodyPad + this.scrollbarWidth);
    };

    Modal.prototype.resetScrollbar = function () {
        this.$body.css('padding-right', this.originalBodyPad);
    };

    Modal.prototype.measureScrollbar = function () {
        // thx walsh
        var scrollDiv = document.createElement('div');
        scrollDiv.className = 'modal-scrollbar-measure';
        this.$body.append(scrollDiv);
        var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
        this.$body[0].removeChild(scrollDiv);
        return scrollbarWidth;
    };

    // MODAL PLUGIN DEFINITION
    // =======================

    function Plugin(option, _relatedTarget) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('bs.modal');
            var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option);

            if (!data) $this.data('bs.modal', (data = new Modal(this, options)));
            if (typeof option == 'string') data[option](_relatedTarget);
            else if (options.show) data.show(_relatedTarget);
        });
    }

    var old = $.fn.modal;

    $.fn.modal = Plugin;
    $.fn.modal.Constructor = Modal;

    // MODAL NO CONFLICT
    // =================

    $.fn.modal.noConflict = function () {
        $.fn.modal = old;
        return this;
    };

    // MODAL DATA-API
    // ==============

    $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
        var $this = $(this);
        var href = $this.attr('href');
        var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))); // strip for ie7
        var option = $target.data('bs.modal')
            ? 'toggle'
            : $.extend({remote: !/#/.test(href) && href}, $target.data(), $this.data());

        if ($this.is('a')) e.preventDefault();

        $target.one('show.bs.modal', function (showEvent) {
            if (showEvent.isDefaultPrevented()) return; // only register focus restorer if modal will actually get shown
            $target.one('hidden.bs.modal', function () {
                $this.is(':visible') && $this.trigger('focus');
            });
        });
        Plugin.call($target, option, this);
    });
})(jQuery);

/* ======================================================================== */

+(function ($) {
    'use strict';

    // TOOLTIP PUBLIC CLASS DEFINITION
    // ===============================

    var Tooltip = function (element, options) {
        this.type = null;
        this.options = null;
        this.enabled = null;
        this.timeout = null;
        this.hoverState = null;
        this.$element = null;

        this.init('tooltip', element, options);
    };

    Tooltip.VERSION = '3.3.4';

    Tooltip.TRANSITION_DURATION = 150;

    Tooltip.DEFAULTS = {
        animation: true,
        placement: 'top',
        selector: false,
        template:
            '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
        trigger: 'hover focus',
        title: '',
        delay: 0,
        html: false,
        container: false,
        viewport: {
            selector: 'body',
            padding: 0,
        },
    };

    Tooltip.prototype.init = function (type, element, options) {
        this.enabled = true;
        this.type = type;
        this.$element = $(element);
        this.options = this.getOptions(options);
        this.$viewport =
            this.options.viewport && $(this.options.viewport.selector || this.options.viewport);

        if (this.$element[0] instanceof document.constructor && !this.options.selector) {
            throw new Error(
                '`selector` option must be specified when initializing ' +
                this.type +
                ' on the window.document object!',
            );
        }

        var triggers = this.options.trigger.split(' ');

        for (var i = triggers.length; i--;) {
            var trigger = triggers[i];

            if (trigger == 'click') {
                this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this));
            } else if (trigger != 'manual') {
                var eventIn = trigger == 'hover' ? 'mouseenter' : 'focusin';
                var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout';

                this.$element.on(
                    eventIn + '.' + this.type,
                    this.options.selector,
                    $.proxy(this.enter, this),
                );
                this.$element.on(
                    eventOut + '.' + this.type,
                    this.options.selector,
                    $.proxy(this.leave, this),
                );
            }
        }

        this.options.selector
            ? (this._options = $.extend({}, this.options, {trigger: 'manual', selector: ''}))
            : this.fixTitle();
    };

    Tooltip.prototype.getDefaults = function () {
        return Tooltip.DEFAULTS;
    };

    Tooltip.prototype.getOptions = function (options) {
        options = $.extend({}, this.getDefaults(), this.$element.data(), options);

        if (options.delay && typeof options.delay == 'number') {
            options.delay = {
                show: options.delay,
                hide: options.delay,
            };
        }

        return options;
    };

    Tooltip.prototype.getDelegateOptions = function () {
        var options = {};
        var defaults = this.getDefaults();

        this._options &&
        $.each(this._options, function (key, value) {
            if (defaults[key] != value) options[key] = value;
        });

        return options;
    };

    Tooltip.prototype.enter = function (obj) {
        var self = obj instanceof this.constructor ? obj : $(obj.currentTarget).data('bs.' + this.type);

        if (self && self.$tip && self.$tip.is(':visible')) {
            self.hoverState = 'in';
            return;
        }

        if (!self) {
            self = new this.constructor(obj.currentTarget, this.getDelegateOptions());
            $(obj.currentTarget).data('bs.' + this.type, self);
        }

        clearTimeout(self.timeout);

        self.hoverState = 'in';

        if (!self.options.delay || !self.options.delay.show) return self.show();

        self.timeout = setTimeout(function () {
            if (self.hoverState == 'in') self.show();
        }, self.options.delay.show);
    };

    Tooltip.prototype.leave = function (obj) {
        var self = obj instanceof this.constructor ? obj : $(obj.currentTarget).data('bs.' + this.type);

        if (!self) {
            self = new this.constructor(obj.currentTarget, this.getDelegateOptions());
            $(obj.currentTarget).data('bs.' + this.type, self);
        }

        clearTimeout(self.timeout);

        self.hoverState = 'out';

        if (!self.options.delay || !self.options.delay.hide) return self.hide();

        self.timeout = setTimeout(function () {
            if (self.hoverState == 'out') self.hide();
        }, self.options.delay.hide);
    };

    Tooltip.prototype.show = function () {
        var e = $.Event('show.bs.' + this.type);

        if (this.hasContent() && this.enabled) {
            this.$element.trigger(e);

            var inDom = $.contains(this.$element[0].ownerDocument.documentElement, this.$element[0]);
            if (e.isDefaultPrevented() || !inDom) return;
            var that = this;

            var $tip = this.tip();

            var tipId = this.getUID(this.type);

            this.setContent();
            $tip.attr('id', tipId);
            this.$element.attr('aria-describedby', tipId);

            if (this.options.animation) $tip.addClass('fade');

            var placement =
                typeof this.options.placement == 'function'
                    ? this.options.placement.call(this, $tip[0], this.$element[0])
                    : this.options.placement;

            var autoToken = /\s?auto?\s?/i;
            var autoPlace = autoToken.test(placement);
            if (autoPlace) placement = placement.replace(autoToken, '') || 'top';

            $tip
                .detach()
                .css({top: 0, left: 0, display: 'block'})
                .addClass(placement)
                .data('bs.' + this.type, this);

            this.options.container
                ? $tip.appendTo(this.options.container)
                : $tip.insertAfter(this.$element);

            var pos = this.getPosition();
            var actualWidth = $tip[0].offsetWidth;
            var actualHeight = $tip[0].offsetHeight;

            if (autoPlace) {
                var orgPlacement = placement;
                var $container = this.options.container
                    ? $(this.options.container)
                    : this.$element.parent();
                var containerDim = this.getPosition($container);

                placement =
                    placement == 'bottom' && pos.bottom + actualHeight > containerDim.bottom
                        ? 'top'
                        : placement == 'top' && pos.top - actualHeight < containerDim.top
                            ? 'bottom'
                            : placement == 'right' && pos.right + actualWidth > containerDim.width
                                ? 'left'
                                : placement == 'left' && pos.left - actualWidth < containerDim.left
                                    ? 'right'
                                    : placement;

                $tip.removeClass(orgPlacement).addClass(placement);
            }

            var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight);

            this.applyPlacement(calculatedOffset, placement);

            var complete = function () {
                var prevHoverState = that.hoverState;
                that.$element.trigger('shown.bs.' + that.type);
                that.hoverState = null;

                if (prevHoverState == 'out') that.leave(that);
            };

            $.support.transition && this.$tip.hasClass('fade')
                ? $tip.one('bsTransitionEnd', complete).emulateTransitionEnd(Tooltip.TRANSITION_DURATION)
                : complete();
        }
    };

    Tooltip.prototype.applyPlacement = function (offset, placement) {
        var $tip = this.tip();
        var width = $tip[0].offsetWidth;
        var height = $tip[0].offsetHeight;

        // manually read margins because getBoundingClientRect includes difference
        var marginTop = parseInt($tip.css('margin-top'), 10);
        var marginLeft = parseInt($tip.css('margin-left'), 10);

        // we must check for NaN for ie 8/9
        if (isNaN(marginTop)) marginTop = 0;
        if (isNaN(marginLeft)) marginLeft = 0;

        offset.top = offset.top + marginTop;
        offset.left = offset.left + marginLeft;

        // $.fn.offset doesn't round pixel values
        // so we use setOffset directly with our own function B-0
        $.offset.setOffset(
            $tip[0],
            $.extend(
                {
                    using: function (props) {
                        $tip.css({
                            top: Math.round(props.top),
                            left: Math.round(props.left),
                        });
                    },
                },
                offset,
            ),
            0,
        );

        $tip.addClass('in');

        // check to see if placing tip in new offset caused the tip to resize itself
        var actualWidth = $tip[0].offsetWidth;
        var actualHeight = $tip[0].offsetHeight;

        if (placement == 'top' && actualHeight != height) {
            offset.top = offset.top + height - actualHeight;
        }

        var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight);

        if (delta.left) offset.left += delta.left;
        else offset.top += delta.top;

        var isVertical = /top|bottom/.test(placement);
        var arrowDelta = isVertical
            ? delta.left * 2 - width + actualWidth
            : delta.top * 2 - height + actualHeight;
        var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight';

        $tip.offset(offset);
        this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical);
    };

    Tooltip.prototype.replaceArrow = function (delta, dimension, isVertical) {
        this.arrow()
            .css(isVertical ? 'left' : 'top', 50 * (1 - delta / dimension) + '%')
            .css(isVertical ? 'top' : 'left', '');
    };

    Tooltip.prototype.setContent = function () {
        var $tip = this.tip();
        var title = this.getTitle();

        $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title);
        $tip.removeClass('fade in top bottom left right');
    };

    Tooltip.prototype.hide = function (callback) {
        var that = this;
        var $tip = $(this.$tip);
        var e = $.Event('hide.bs.' + this.type);

        function complete() {
            if (that.hoverState != 'in') $tip.detach();
            that.$element.removeAttr('aria-describedby').trigger('hidden.bs.' + that.type);
            callback && callback();
        }

        this.$element.trigger(e);

        if (e.isDefaultPrevented()) return;

        $tip.removeClass('in');

        $.support.transition && $tip.hasClass('fade')
            ? $tip.one('bsTransitionEnd', complete).emulateTransitionEnd(Tooltip.TRANSITION_DURATION)
            : complete();

        this.hoverState = null;

        return this;
    };

    Tooltip.prototype.fixTitle = function () {
        var $e = this.$element;
        if ($e.attr('title') || typeof $e.attr('data-original-title') != 'string') {
            $e.attr('data-original-title', $e.attr('title') || '').attr('title', '');
        }
    };

    Tooltip.prototype.hasContent = function () {
        return this.getTitle();
    };

    Tooltip.prototype.getPosition = function ($element) {
        $element = $element || this.$element;

        var el = $element[0];
        var isBody = el.tagName == 'BODY';

        var elRect = el.getBoundingClientRect();
        if (elRect.width == null) {
            // width and height are missing in IE8, so compute them manually; see https://github.com/twbs/bootstrap/issues/14093
            elRect = $.extend({}, elRect, {
                width: elRect.right - elRect.left,
                height: elRect.bottom - elRect.top,
            });
        }
        var elOffset = isBody ? {top: 0, left: 0} : $element.offset();
        var scroll = {
            scroll: isBody
                ? document.documentElement.scrollTop || document.body.scrollTop
                : $element.scrollTop(),
        };
        var outerDims = isBody ? {width: $(window).width(), height: $(window).height()} : null;

        return $.extend({}, elRect, scroll, outerDims, elOffset);
    };

    Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
        return placement == 'bottom'
            ? {top: pos.top + pos.height, left: pos.left + pos.width / 2 - actualWidth / 2}
            : placement == 'top'
                ? {top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2}
                : placement == 'left'
                    ? {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth}
                    : /* placement == 'right' */
                    {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width};
    };

    Tooltip.prototype.getViewportAdjustedDelta = function (
        placement,
        pos,
        actualWidth,
        actualHeight,
    ) {
        var delta = {top: 0, left: 0};
        if (!this.$viewport) return delta;

        var viewportPadding = (this.options.viewport && this.options.viewport.padding) || 0;
        var viewportDimensions = this.getPosition(this.$viewport);

        if (/right|left/.test(placement)) {
            var topEdgeOffset = pos.top - viewportPadding - viewportDimensions.scroll;
            var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight;
            if (topEdgeOffset < viewportDimensions.top) {
                // top overflow
                delta.top = viewportDimensions.top - topEdgeOffset;
            } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) {
                // bottom overflow
                delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset;
            }
        } else {
            var leftEdgeOffset = pos.left - viewportPadding;
            var rightEdgeOffset = pos.left + viewportPadding + actualWidth;
            if (leftEdgeOffset < viewportDimensions.left) {
                // left overflow
                delta.left = viewportDimensions.left - leftEdgeOffset;
            } else if (rightEdgeOffset > viewportDimensions.width) {
                // right overflow
                delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset;
            }
        }

        return delta;
    };

    Tooltip.prototype.getTitle = function () {
        var title;
        var $e = this.$element;
        var o = this.options;

        title =
            $e.attr('data-original-title') ||
            (typeof o.title == 'function' ? o.title.call($e[0]) : o.title);

        return title;
    };

    Tooltip.prototype.getUID = function (prefix) {
        do prefix += ~~(Math.random() * 1000000);
        while (document.getElementById(prefix));
        return prefix;
    };

    Tooltip.prototype.tip = function () {
        return (this.$tip = this.$tip || $(this.options.template));
    };

    Tooltip.prototype.arrow = function () {
        return (this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow'));
    };

    Tooltip.prototype.enable = function () {
        this.enabled = true;
    };

    Tooltip.prototype.disable = function () {
        this.enabled = false;
    };

    Tooltip.prototype.toggleEnabled = function () {
        this.enabled = !this.enabled;
    };

    Tooltip.prototype.toggle = function (e) {
        var self = this;
        if (e) {
            self = $(e.currentTarget).data('bs.' + this.type);
            if (!self) {
                self = new this.constructor(e.currentTarget, this.getDelegateOptions());
                $(e.currentTarget).data('bs.' + this.type, self);
            }
        }

        self.tip().hasClass('in') ? self.leave(self) : self.enter(self);
    };

    Tooltip.prototype.destroy = function () {
        var that = this;
        clearTimeout(this.timeout);
        this.hide(function () {
            that.$element.off('.' + that.type).removeData('bs.' + that.type);
        });
    };

    // TOOLTIP PLUGIN DEFINITION
    // =========================

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('bs.tooltip');
            var options = typeof option == 'object' && option;

            if (!data && /destroy|hide/.test(option)) return;
            if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)));
            if (typeof option == 'string') data[option]();
        });
    }

    var old = $.fn.tooltip;

    $.fn.tooltip = Plugin;
    $.fn.tooltip.Constructor = Tooltip;

    // TOOLTIP NO CONFLICT
    // ===================

    $.fn.tooltip.noConflict = function () {
        $.fn.tooltip = old;
        return this;
    };
})(jQuery);

/* ======================================================================== */

+(function ($) {
    'use strict';

    // POPOVER PUBLIC CLASS DEFINITION
    // ===============================

    var Popover = function (element, options) {
        this.init('popover', element, options);
    };

    if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js');

    Popover.VERSION = '3.3.4';

    Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
        placement: 'right',
        trigger: 'click',
        content: '',
        template:
            '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
    });

    // NOTE: POPOVER EXTENDS tooltip.js
    // ================================

    Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype);

    Popover.prototype.constructor = Popover;

    Popover.prototype.getDefaults = function () {
        return Popover.DEFAULTS;
    };

    Popover.prototype.setContent = function () {
        var $tip = this.tip();
        var title = this.getTitle();
        var content = this.getContent();

        $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title);
        $tip
            .find('.popover-content')
            .children()
            .detach()
            .end() // we use append for html objects to maintain js events
            [this.options.html ? (typeof content == 'string' ? 'html' : 'append') : 'text'](content);

        $tip.removeClass('fade top bottom left right in');

        // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
        // this manually by checking the contents.
        if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide();
    };

    Popover.prototype.hasContent = function () {
        return this.getTitle() || this.getContent();
    };

    Popover.prototype.getContent = function () {
        var $e = this.$element;
        var o = this.options;

        return (
            $e.attr('data-content') ||
            (typeof o.content == 'function' ? o.content.call($e[0]) : o.content)
        );
    };

    Popover.prototype.arrow = function () {
        return (this.$arrow = this.$arrow || this.tip().find('.arrow'));
    };

    // POPOVER PLUGIN DEFINITION
    // =========================

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('bs.popover');
            var options = typeof option == 'object' && option;

            if (!data && /destroy|hide/.test(option)) return;
            if (!data) $this.data('bs.popover', (data = new Popover(this, options)));
            if (typeof option == 'string') data[option]();
        });
    }

    var old = $.fn.popover;

    $.fn.popover = Plugin;
    $.fn.popover.Constructor = Popover;

    // POPOVER NO CONFLICT
    // ===================

    $.fn.popover.noConflict = function () {
        $.fn.popover = old;
        return this;
    };
})(jQuery);

/* ======================================================================== */

+(function ($) {
    'use strict';

    // SCROLLSPY CLASS DEFINITION
    // ==========================

    function ScrollSpy(element, options) {
        this.$body = $(document.body);
        this.$scrollElement = $(element).is(document.body) ? $(window) : $(element);
        this.options = $.extend({}, ScrollSpy.DEFAULTS, options);
        this.selector = (this.options.target || '') + ' .nav li > a';
        this.offsets = [];
        this.targets = [];
        this.activeTarget = null;
        this.scrollHeight = 0;

        this.$scrollElement.on('scroll.bs.scrollspy', $.proxy(this.process, this));
        this.refresh();
        this.process();
    }

    ScrollSpy.VERSION = '3.3.4';

    ScrollSpy.DEFAULTS = {
        offset: 10,
    };

    ScrollSpy.prototype.getScrollHeight = function () {
        return (
            this.$scrollElement[0].scrollHeight ||
            Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
        );
    };

    ScrollSpy.prototype.refresh = function () {
        var that = this;
        var offsetMethod = 'offset';
        var offsetBase = 0;

        this.offsets = [];
        this.targets = [];
        this.scrollHeight = this.getScrollHeight();

        if (!$.isWindow(this.$scrollElement[0])) {
            offsetMethod = 'position';
            offsetBase = this.$scrollElement.scrollTop();
        }

        this.$body
            .find(this.selector)
            .map(function () {
                var $el = $(this);
                var href = $el.data('target') || $el.attr('href');
                var $href = /^#./.test(href) && $(href);

                return (
                    ($href &&
                        $href.length &&
                        $href.is(':visible') && [[$href[offsetMethod]().top + offsetBase, href]]) ||
                    null
                );
            })
            .sort(function (a, b) {
                return a[0] - b[0];
            })
            .each(function () {
                that.offsets.push(this[0]);
                that.targets.push(this[1]);
            });
    };

    ScrollSpy.prototype.process = function () {
        var scrollTop = this.$scrollElement.scrollTop() + this.options.offset;
        var scrollHeight = this.getScrollHeight();
        var maxScroll = this.options.offset + scrollHeight - this.$scrollElement.height();
        var offsets = this.offsets;
        var targets = this.targets;
        var activeTarget = this.activeTarget;
        var i;

        if (this.scrollHeight != scrollHeight) {
            this.refresh();
        }

        if (scrollTop >= maxScroll) {
            return activeTarget != (i = targets[targets.length - 1]) && this.activate(i);
        }

        if (activeTarget && scrollTop < offsets[0]) {
            this.activeTarget = null;
            return this.clear();
        }

        for (i = offsets.length; i--;) {
            activeTarget != targets[i] &&
            scrollTop >= offsets[i] &&
            (offsets[i + 1] === undefined || scrollTop < offsets[i + 1]) &&
            this.activate(targets[i]);
        }
    };

    ScrollSpy.prototype.activate = function (target) {
        this.activeTarget = target;

        this.clear();

        var selector =
            this.selector + '[data-target="' + target + '"],' + this.selector + '[href="' + target + '"]';

        var active = $(selector).parents('li').addClass('active');

        if (active.parent('.dropdown-menu').length) {
            active = active.closest('li.dropdown').addClass('active');
        }

        active.trigger('activate.bs.scrollspy');
    };

    ScrollSpy.prototype.clear = function () {
        $(this.selector).parentsUntil(this.options.target, '.active').removeClass('active');
    };

    // SCROLLSPY PLUGIN DEFINITION
    // ===========================

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('bs.scrollspy');
            var options = typeof option == 'object' && option;

            if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)));
            if (typeof option == 'string') data[option]();
        });
    }

    var old = $.fn.scrollspy;

    $.fn.scrollspy = Plugin;
    $.fn.scrollspy.Constructor = ScrollSpy;

    // SCROLLSPY NO CONFLICT
    // =====================

    $.fn.scrollspy.noConflict = function () {
        $.fn.scrollspy = old;
        return this;
    };

    // SCROLLSPY DATA-API
    // ==================

    $(window).on('load.bs.scrollspy.data-api', function () {
        $('[data-spy="scroll"]').each(function () {
            var $spy = $(this);
            Plugin.call($spy, $spy.data());
        });
    });
})(jQuery);

/* ======================================================================== */

+(function ($) {
    'use strict';

    // TAB CLASS DEFINITION
    // ====================

    var Tab = function (element) {
        this.element = $(element);
    };

    Tab.VERSION = '3.3.4';

    Tab.TRANSITION_DURATION = 150;

    Tab.prototype.show = function () {
        var $this = this.element;
        var $ul = $this.closest('ul:not(.dropdown-menu)');
        var selector = $this.data('target');

        if (!selector) {
            selector = $this.attr('href');
            selector = selector && selector.replace(/.*(?=#[^\s]*$)/, ''); // strip for ie7
        }

        if ($this.parent('li').hasClass('active')) return;

        var $previous = $ul.find('.active:last a');
        var hideEvent = $.Event('hide.bs.tab', {
            relatedTarget: $this[0],
        });
        var showEvent = $.Event('show.bs.tab', {
            relatedTarget: $previous[0],
        });

        $previous.trigger(hideEvent);
        $this.trigger(showEvent);

        if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) return;

        var $target = $(selector);

        this.activate($this.closest('li'), $ul);
        this.activate($target, $target.parent(), function () {
            $previous.trigger({
                type: 'hidden.bs.tab',
                relatedTarget: $this[0],
            });
            $this.trigger({
                type: 'shown.bs.tab',
                relatedTarget: $previous[0],
            });
        });
    };

    Tab.prototype.activate = function (element, container, callback) {
        var $active = container.find('> .active');
        var transition =
            callback &&
            $.support.transition &&
            (($active.length && $active.hasClass('fade')) || !!container.find('> .fade').length);

        function next() {
            $active
                .removeClass('active')
                .find('> .dropdown-menu > .active')
                .removeClass('active')
                .end()
                .find('[data-toggle="tab"]')
                .attr('aria-expanded', false);

            element.addClass('active').find('[data-toggle="tab"]').attr('aria-expanded', true);

            if (transition) {
                element[0].offsetWidth; // reflow for transition
                element.addClass('in');
            } else {
                element.removeClass('fade');
            }

            if (element.parent('.dropdown-menu').length) {
                element
                    .closest('li.dropdown')
                    .addClass('active')
                    .end()
                    .find('[data-toggle="tab"]')
                    .attr('aria-expanded', true);
            }

            callback && callback();
        }

        $active.length && transition
            ? $active.one('bsTransitionEnd', next).emulateTransitionEnd(Tab.TRANSITION_DURATION)
            : next();

        $active.removeClass('in');
    };

    // TAB PLUGIN DEFINITION
    // =====================

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('bs.tab');

            if (!data) $this.data('bs.tab', (data = new Tab(this)));
            if (typeof option == 'string') data[option]();
        });
    }

    var old = $.fn.tab;

    $.fn.tab = Plugin;
    $.fn.tab.Constructor = Tab;

    // TAB NO CONFLICT
    // ===============

    $.fn.tab.noConflict = function () {
        $.fn.tab = old;
        return this;
    };

    // TAB DATA-API
    // ============

    var clickHandler = function (e) {
        e.preventDefault();
        Plugin.call($(this), 'show');
    };

    $(document)
        .on('click.bs.tab.data-api', '[data-toggle="tab"]', clickHandler)
        .on('click.bs.tab.data-api', '[data-toggle="pill"]', clickHandler);
})(jQuery);

/* ======================================================================== */

+(function ($) {
    'use strict';

    // AFFIX CLASS DEFINITION
    // ======================

    var Affix = function (element, options) {
        this.options = $.extend({}, Affix.DEFAULTS, options);

        this.$target = $(this.options.target)
            .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
            .on('click.bs.affix.data-api', $.proxy(this.checkPositionWithEventLoop, this));

        this.$element = $(element);
        this.affixed = null;
        this.unpin = null;
        this.pinnedOffset = null;

        this.checkPosition();
    };

    Affix.VERSION = '3.3.4';

    Affix.RESET = 'affix affix-top affix-bottom';

    Affix.DEFAULTS = {
        offset: 0,
        target: window,
    };

    Affix.prototype.getState = function (scrollHeight, height, offsetTop, offsetBottom) {
        var scrollTop = this.$target.scrollTop();
        var position = this.$element.offset();
        var targetHeight = this.$target.height();

        if (offsetTop != null && this.affixed == 'top') return scrollTop < offsetTop ? 'top' : false;

        if (this.affixed == 'bottom') {
            if (offsetTop != null) return scrollTop + this.unpin <= position.top ? false : 'bottom';
            return scrollTop + targetHeight <= scrollHeight - offsetBottom ? false : 'bottom';
        }

        var initializing = this.affixed == null;
        var colliderTop = initializing ? scrollTop : position.top;
        var colliderHeight = initializing ? targetHeight : height;

        if (offsetTop != null && scrollTop <= offsetTop) return 'top';
        if (offsetBottom != null && colliderTop + colliderHeight >= scrollHeight - offsetBottom)
            return 'bottom';

        return false;
    };

    Affix.prototype.getPinnedOffset = function () {
        if (this.pinnedOffset) return this.pinnedOffset;
        this.$element.removeClass(Affix.RESET).addClass('affix');
        var scrollTop = this.$target.scrollTop();
        var position = this.$element.offset();
        return (this.pinnedOffset = position.top - scrollTop);
    };

    Affix.prototype.checkPositionWithEventLoop = function () {
        setTimeout($.proxy(this.checkPosition, this), 1);
    };

    Affix.prototype.checkPosition = function () {
        if (!this.$element.is(':visible')) return;

        var height = this.$element.height();
        var offset = this.options.offset;
        var offsetTop = offset.top;
        var offsetBottom = offset.bottom;
        var scrollHeight = $(document.body).height();

        if (typeof offset != 'object') offsetBottom = offsetTop = offset;
        if (typeof offsetTop == 'function') offsetTop = offset.top(this.$element);
        if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element);

        var affix = this.getState(scrollHeight, height, offsetTop, offsetBottom);

        if (this.affixed != affix) {
            if (this.unpin != null) this.$element.css('top', '');

            var affixType = 'affix' + (affix ? '-' + affix : '');
            var e = $.Event(affixType + '.bs.affix');

            this.$element.trigger(e);

            if (e.isDefaultPrevented()) return;

            this.affixed = affix;
            this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null;

            this.$element
                .removeClass(Affix.RESET)
                .addClass(affixType)
                .trigger(affixType.replace('affix', 'affixed') + '.bs.affix');
        }

        if (affix == 'bottom') {
            this.$element.offset({
                top: scrollHeight - height - offsetBottom,
            });
        }
    };

    // AFFIX PLUGIN DEFINITION
    // =======================

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('bs.affix');
            var options = typeof option == 'object' && option;

            if (!data) $this.data('bs.affix', (data = new Affix(this, options)));
            if (typeof option == 'string') data[option]();
        });
    }

    var old = $.fn.affix;

    $.fn.affix = Plugin;
    $.fn.affix.Constructor = Affix;

    // AFFIX NO CONFLICT
    // =================

    $.fn.affix.noConflict = function () {
        $.fn.affix = old;
        return this;
    };

    // AFFIX DATA-API
    // ==============

    $(window).on('load', function () {
        $('[data-spy="affix"]').each(function () {
            var $spy = $(this);
            var data = $spy.data();

            data.offset = data.offset || {};

            if (data.offsetBottom != null) data.offset.bottom = data.offsetBottom;
            if (data.offsetTop != null) data.offset.top = data.offsetTop;

            Plugin.call($spy, data);
        });
    });
})(jQuery);


/* ======================================================================== */
/* CHANGE 'HEADER BOT && BAN TOP' TO 'HEADER NAV' - Временное решение */

const headerNew = `
    <div class="loaf_header">
        <label class="btn back_btn" onclick="history.back()">
            <i class="fa fa-angle-left" aria-hidden="true"></i>
        </label>
        <div class="logo">
            <a href="index.html">
                <span>Soft</span>
                <p>Gr</p>
                <img src="/images/header/globs.webp" alt="logo">
                <p>up</p>
            </a>
        </div>
        <input type="radio" name="slider" id="menu_btn">
        <input type="radio" name="slider" id="close_btn">
        <ul class="loaf_header_links">
            <label for="close_btn" class="btn close_btn">
                <i class="fa fa-times" aria-hidden="true"></i>
            </label>
            <li><a href="index.html" class="loaf_header_links_line">Главная</a></li>
            <li>
                <a href="products.html" class="desktop_item loaf_header_links_line">Оборудование</a>
                <input type="checkbox" id="showProducts">
                <label for="showProducts" class="mobile_item">Оборудование</label>
                <div class="products_box">
                    <div class="products_content">
                        <div class="products_content_column">
                            <img src="/images/header/icon_1.webp" alt="Icons">
                        </div>
                        <div class="products_content_column">
                            <ul class="products_box_list">
                                <li><a href="pos.html" data-image="/images/header/icon_1.webp">POS системы</a></li>
                                <li><a href="computer.html" data-image="/images/header/icon_2.webp">Компьютеры</a></li>
                                <li><a href="scanner.html" data-image="/images/header/icon_3.webp">Сканеры штрих-кодов</a></li>
                            </ul>
                        </div>
                        <div class="products_content_column">
                            <ul class="products_box_list">
                                <li><a href="printer.html" data-image="/images/header/icon_4.webp">Принтеры чеков и этикеток</a></li>
                                <li><a href="till.html" data-image="/images/header/icon_5.webp">Денежные ящики</a></li>
                                <li><a href="scale.html" data-image="/images/header/icon_6.webp">Весы электронные</a></li>
                            </ul>
                        </div>
                        <div class="products_content_column">
                            <ul class="products_box_list">
                                <li><a href="terminal.html" data-image="/images/header/icon_7.webp">Терминалы</a></li>
                                <li><a href="banknotes.html" data-image="/images/header/icon_8.webp">Счетчики и детекторы</a></li>
                                <li><a href="eas.html" data-image="/images/header/icon_9.webp">Антикражное оборудование</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </li>
            <li>
                <a href="programs.html" class="desktop_item loaf_header_links_line">Программы</a>
                <input type="checkbox" id="showPrograms">
                <label for="showPrograms" class="mobile_item">Программы</label>
                <ul class="programs_list">
                    <li><a href="programs.html#one_c"><img src="/images/header/1_1c.webp" alt="1c">1С Розница</a></li>
                    <li><a href="programs.html#r_keeper"><img src="/images/header/2_r_keeper.webp" alt="r_keeper">R-keeper</a></li>
                    <li><a href="programs.html#umag"><img src="/images/header/3_umag.webp" alt="umag">Umag</a></li>
                </ul>
            </li>
            <li><a href="automation.html" class="loaf_header_links_line">Автоматизация</a></li>
            <li><a href="reviews.php" class="loaf_header_links_line">Отзывы</a></li>
            <li><a href="about.html" class="loaf_header_links_line">О нас</a></li>
            <li><a href="contact.html" class="loaf_header_links_line">Контакты</a></li>
        </ul>
        <label for="menu_btn" class="btn menu_btn">
            <i class="fa fa-align-justify" aria-hidden="true"></i>
        </label>
    </div>
    <div class="boot_header">
        <div class="boot_header_container">
            <div class="burger_btn">
                <div class="burger_text">
                    <span><i class="fa fa-th-large fa-2x" aria-hidden="true"></i><p>&nbsp; Каталог товаров</p></span>
                    <span><i class="fa fa-th-large fa-2x" aria-hidden="true"></i><p>&nbsp; Каталог товаров</p></span>
                </div>
            </div>
            <div class="search_box">
                <span class="search_box_btn">
                    <i class="fa fa-search"></i>
                </span>
                <label for="search_box_input"></label>
                <input class="search_box_input" autocomplete="off" id="search_box_input" type="text">
            </div>
            <div class="contact_info">
                <div class="contact_info_btn">
                    <span class="contact_city_name">Алматы</span>
                    <span class="contact_info_arrow"></span>
                    <span class="contact_city_number">
                        <a href="tel:87273449900"> &nbsp 8 (727) <span class="contact_city_number_b">344-99-00</span></a>
                    </span>
                    <div class="cont_icon_menu">
                        <div class="cont_circle_0 fa fa-phone" aria-hidden="true"></div>
                        <div class="cont_circle_1"></div>
                        <div class="cont_circle_2"></div>
                        <div class="cont_circle_3"></div>
                        <div class="cont_circle_4"></div>
                    </div>
                </div>
                <div class="contact_drop_down">
                    <div class="contact_drop_down_items">
                        <div class="contact_drop_down_city">
                            <span class="contact_drop_down_item_line"></span>
                            <span class="contact_drop_down_item_city contact_drop_down_city_hidden">Алматы</span>
                        </div>
                        <div class="contact_drop_down_item_number">
                            <a href="tel:87012667700"> +7 (701) <span class="contact_city_number_b">266-77-00</span></a>
                        </div>
                    </div>
                    <br>
                    <div class="contact_drop_down_items">
                        <div class="contact_drop_down_city">
                            <span class="contact_drop_down_item_line"></span>
                            <span class="contact_drop_down_item_city">Астана</span>
                        </div>
                        <div class="contact_drop_down_item_number">
                            <a href="tel:87172279900" class="contact_drop_down_mobile_hidden"> &nbsp 8 (7172) <span class="contact_city_number_b">27-99-00</span></a>
                            <br class="contact_drop_down_mobile_hidden">
                            <a href="tel:87015112200"> +7 (701) <span class="contact_city_number_b">511-22-00</span></a>
                        </div>
                    </div>
                    <br>
                    <div class="contact_drop_down_items">
                        <div class="contact_drop_down_city">
                            <span class="contact_drop_down_item_line"></span>
                            <span class="contact_drop_down_item_city">Шымкент</span>
                        </div>
                        <div class="contact_drop_down_item_number">
                            <a href="tel:87252399900" class="contact_drop_down_mobile_hidden"> &nbsp 8 (7252) <span class="contact_city_number_b">39-99-00</span></a>
                            <br class="contact_drop_down_mobile_hidden">
                            <a href="tel:87019447700"> +7 (701) <span class="contact_city_number_b">944-77-00</span></a>
                        </div>
                    </div>
                    <br>
                </div>
            </div>
            <div class="open_cart_btn" id="open_cart_btn">
                <img src="/images/header/cart.webp" alt="Cart">
                <p>Корзина</p>
                <span class="open_cart_number label-place"></span>
            </div>
        </div>
    </div>
    <div class="burger_category_menu">
        <button class="burger_menu_close">
            <div class="close-container">
                <div class="burger_menu_left"></div>
                <div class="burger_menu_right"></div>
            </div>
        </button>
        <ul class="burger_menu_content">
            <li class="burger_category_items">
                <a href="pos.html">
                    <ul class="burger_category_parent">
                        <div class="burger_category_title">
                            <img src="/images/header/icon_1s.webp" alt="pos">
                            <h3>POS системы</h3>
                        </div>
                        <div class="burger_category_arrow"></div>
                    </ul>
                </a>
                <ul class="burger_category_children">
                    <li>
                        <a href="pos_monoblock.html">
                            <img src="/images/header/icon_1s_1.webp" alt="pos">
                            <h4>Сенсорные моноблоки</h4>
                        </a>
                    </li>
                    <li>
                        <a href="pos_system.html">
                            <img src="/images/header/icon_1s_2.webp" alt="pos">
                            <h4>POS системы</h4>
                        </a>
                    </li>
                    <li>
                        <a href="pos_accessories.html">
                            <img src="/images/header/icon_1s_3.webp" alt="pos">
                            <h4>Комплектующие</h4>
                        </a>
                    </li>
                </ul>
            </li>
            <li class="burger_category_items">
                <a href="computer.html">
                    <ul class="burger_category_parent">
                        <div class="burger_category_title">
                            <img src="/images/header/icon_2s.webp" alt="computer">
                            <h3>Компьютеры и комплектующие</h3>
                        </div>
                        <div class="burger_category_arrow"></div>
                    </ul>
                </a>
                <ul class="burger_category_children">
                    <li>
                        <a href="computer_block.html">
                            <img src="/images/header/icon_2s_1.webp" alt="computer">
                            <h4>Блок системы</h4>
                        </a>
                    </li>
                    <li>
                        <a href="computer_periferiya.html">
                            <img src="/images/header/icon_2s_2.webp" alt="computer">
                            <h4>Монитор и периферия</h4>
                        </a>
                    </li>
                    <li>
                        <a href="/computer_chair.html">
                            <img src="/images/header/icon_2s_3.webp" alt="computer">
                            <h4>Офисные стулья и кресла</h4>
                        </a>
                    </li>
                </ul>
            </li>
            <li class="burger_category_items">
                <a href="scanner.html">
                    <ul class="burger_category_parent">
                        <div class="burger_category_title">
                            <img src="/images/header/icon_3s.webp" alt="scanner">
                            <h3>Сканеры штрих-кодов</h3>
                        </div>
                        <div class="burger_category_arrow"></div>
                    </ul>
                </a>
                <ul class="burger_category_children">
                    <li>
                        <a href="scanner_hand.html">
                            <img src="/images/header/icon_3s_1.webp" alt="scanner">
                            <h4>Ручные сканеры штрих-кодов</h4>
                        </a>
                    </li>
                    <li>
                        <a href="scanner_desktop.html">
                            <img src="/images/header/icon_3s_2.webp" alt="scanner">
                            <h4>Настольные сканеры штрих-кодов</h4>
                        </a>
                    </li>
                </ul>
            </li>
            <li class="burger_category_items">
                <a href="printer.html">
                    <ul class="burger_category_parent">
                        <div class="burger_category_title">
                            <img src="/images/header/icon_4s.webp" alt="printer">
                            <h3>Принтеры чеков и этикеток</h3>
                        </div>
                        <div class="burger_category_arrow"></div>
                    </ul>
                </a>
                <ul class="burger_category_children">
                    <li>
                        <a href="printer_receipt.html">
                            <img src="/images/header/icon_4s_1.webp" alt="printer">
                            <h4>Принтеры чеков</h4>
                        </a>
                    </li>
                    <li>
                        <a href="printer_label.html">
                            <img src="/images/header/icon_4s_2.webp" alt="printer">
                            <h4>Принтеры этикеток</h4>
                        </a>
                    </li>
                </ul>
            </li>
            <li class="burger_category_items">
                <a href="till.html">
                    <ul class="burger_category_parent">
                        <div class="burger_category_title">
                            <img src="/images/header/icon_5s.webp" alt="till">
                            <h3>Денежные ящики</h3>
                        </div>
                    </ul>
                </a>
            </li>
            <li class="burger_category_items">
                <a href="scale.html">
                    <ul class="burger_category_parent">
                        <div class="burger_category_title">
                            <img src="/images/header/icon_6s.webp" alt="scale">
                            <h3>Весы электронные</h3>
                        </div>
                        <div class="burger_category_arrow"></div>
                    </ul>
                </a>
                <ul class="burger_category_children">
                    <li>
                        <a href="scale_none.html">
                            <img src="/images/header/icon_6s_1.webp" alt="scale">
                            <h4>Весы без печати этикеток</h4>
                        </a>
                    </li>
                    <li>
                        <a href="scale_with.html">
                            <img src="/images/header/icon_6s_2.webp" alt="scale">
                            <h4>Весы с печатью этикеток</h4>
                        </a>
                    </li>
                </ul>
            </li>
            <li class="burger_category_items">
                <a href="terminal.html">
                    <ul class="burger_category_parent">
                        <div class="burger_category_title">
                            <img src="/images/header/icon_7s.webp" alt="terminal">
                            <h3>Терминалы сбора данных</h3>
                        </div>
                    </ul>
                </a>
            </li>
            <li class="burger_category_items">
                <a href="banknotes.html">
                    <ul class="burger_category_parent">
                        <div class="burger_category_title">
                            <img src="/images/header/icon_8s.webp" alt="banknotes">
                            <h3>Счетчики и детекторы банкнот</h3>
                        </div>
                        <div class="burger_category_arrow"></div>
                    </ul>
                </a>
                <ul class="burger_category_children">
                    <li>
                        <a href="banknotes_counter.html">
                            <img src="/images/header/icon_8s_1.webp" alt="banknotes">
                            <h4>Счетчики банкнот</h4>
                        </a>
                    </li>
                    <li>
                        <a href="banknotes_detector.html">
                            <img src="/images/header/icon_8s_2.webp" alt="banknotes">
                            <h4>Детекторы банкнот</h4>
                        </a>
                    </li>
                </ul>
            </li>
            <li class="burger_category_items">
                <a href="eas.html">
                    <ul class="burger_category_parent">
                        <div class="burger_category_title">
                            <img src="/images/header/icon_9s.webp" alt="eas">
                            <h3>Антикражное оборудование</h3>
                        </div>
                        <div class="burger_category_arrow"></div>
                    </ul>
                </a>
                <ul class="burger_category_children">
                    <li>
                        <a href="eas_radio.html">
                            <img src="/images/header/icon_9s_1.webp" alt="eas">
                            <h4>Радиочастотная антикражная система</h4>
                        </a>
                    </li>
                    <li>
                        <a href="eas_magnetic.html">
                            <img src="/images/header/icon_9s_2.webp" alt="eas">
                            <h4>Акустомагнитная антикражная система</h4>
                        </a>
                    </li>
                </ul>
            </li>
        </ul>
    </div>
    <div class="overlap">
        <div class="bubbles">
            <span style="--i:16;"><img src="/images/header/icon_1s_2.webp" alt="Bubble"></span>
            <span style="--i:36;"><img src="/images/header/icon_7s.webp" alt="Bubble"></span>
            <span style="--i:27;"><img src="/images/header/icon_3s_1.webp" alt="Bubble"></span>
            <span style="--i:31;"><img src="/images/header/icon_8s_1.webp" alt="Bubble"></span>
            <span style="--i:21;"><img src="/images/header/icon_5s.webp" alt="Bubble"></span>
            <span style="--i:19;"><img src="/images/header/icon_9s.webp" alt="Bubble"></span>
            <span style="--i:41;"><img src="/images/header/icon_2s.webp" alt="Bubble"></span>
            <span style="--i:36;"><img src="/images/header/icon_1s_1.webp" alt="Bubble"></span>
            <span style="--i:15;"><img src="/images/header/icon_6s.webp" alt="Bubble"></span>
            <span style="--i:26;"><img src="/images/header/icon_4s.webp" alt="Bubble"></span>
        </div>
    </div>
    <ul class="lour_header">
        <li class="lour_header_item">
            <a href="index.html">
                <div class="lour_icon">
                    <img src="/images/header/lour_1.webp" alt="Main">
                    <h5>Главная</h5>
                </div>
            </a>
        </li>
        <li class="lour_header_item">
            <a href="programs.html">
                <div class="lour_icon">
                    <img src="/images/header/lour_2.webp" alt="Automation">
                    <h5>Программы</h5>
                </div>
            </a>
        </li>
        <li class="lour_header_item">
            <a href="about.html">
                <div class="lour_icon">
                    <img src="/images/header/lour_3.webp" alt="About">
                    <h5>О нас</h5>
                </div>
            </a>
        </li>
        <li class="lour_header_item">
            <a href="reviews.php">
                <div class="lour_icon">
                    <img src="/images/header/lour_4.webp" alt="Reviews">
                    <h5>Отзывы</h5>
                </div>
            </a>
        </li>
        <li class="lour_header_item">
            <a href="contact.html">
                <div class="lour_icon">
                    <img src="/images/header/lour_5.webp" alt="Contanct">
                    <h5>Контакты</h5>
                </div>
            </a>
        </li>
        <div class="lour_indicator"></div>
    </ul>
`;

let headerOriginTop = document.querySelector('.header-bot');

let headerOriginBan = document.querySelector('.ban-top');

if (headerOriginTop) {
    headerOriginTop.removeAttribute('id');
    headerOriginTop.removeAttribute('class');
    headerOriginTop.classList.add('header_nav');
    headerOriginTop.innerHTML = headerNew;
    console.log('%c Header', 'color: #bada55');
}

if (headerOriginBan) {
    headerOriginBan.remove();
}

/* ======================================================================== */
/* GLOBAL CONST  */

const globalBody = document.querySelector('body');

const globalHeaderNav = document.querySelector('.header_nav');

const globalOverlap = document.querySelector('.overlap');

const globalLourHeader = document.querySelector('.lour_header');

const globalFooter = document.querySelector('.footer');

/* ======================================================================== */
/* LOCATION - SHOWS WHAT PAGE YOU'RE ON */

let match = window.location.href.split('/').pop().split('#')[0].split('?')[0].split('.'[0]).shift();

let loafHeaderLinks = document.querySelectorAll('.loaf_header_links > li > a');

let urlFileName = {
    // Главная
    'index': 0,
    '': 0,
    // Программы
    'programs': 2,
    'r_keeper': 2,
    'r_keeper_cafe': 2,
    'r_keeper_fast': 2,
    'storehouse': 2,
    '1c': 2,
    'pharmacy': 2,
    'accounting': 2,
    'trade': 2,
    'umag_magazin': 2,
    'umag_odejda': 2,
    'umag_cosmetics': 2,
    'umag_pharmacy': 2,
    // Автоматизация
    'automation': 3,
    'market': 3,
    'shop': 3,
    'cosmetic': 3,
    'clothes': 3,
    'restaurant': 3,
    'cafe': 3,
    'fast-food': 3,
    'apteka': 3,
    'sklad': 3,
    'account': 3,
    'production': 3,
    // Отзывы
    'reviews': 4,
    // О нас
    'about': 5,
    // Контакты
    'contact': 6,
    'contact_almaty': 6,
    'contact_astana': 6,
    'contact_shymkent': 6,
    'zakaz': 6,
    'zakaz_astana': 6,
    'pismo': 6,
};

let urlIndex = match == null ? 0 : (urlFileName.hasOwnProperty(match) ? urlFileName[match] : 1);

if (urlIndex >= 0 && urlIndex < loafHeaderLinks.length) {
    loafHeaderLinks[urlIndex].classList.add('header_selected');
}

/* LOUR HEADER - ACTIVE */
const lourHeaderItems = document.querySelectorAll('.lour_header_item');

const lourIndicator = document.querySelector('.lour_indicator');

function activeLink() {
    lourHeaderItems.forEach((item) =>
        item.classList.remove('active'));
    this.classList.add('active')
    lourIndicator.classList.add('active');
}

let urlLourList = {
    // Главная
    'index': 0,
    // Программы
    'programs': 1,
    'r_keeper': 1,
    'r_keeper_cafe': 1,
    'r_keeper_fast': 1,
    'storehouse': 1,
    '1c': 1,
    'pharmacy': 1,
    'accounting': 1,
    'trade': 1,
    'umag_magazin': 1,
    'umag_odejda': 1,
    'umag_cosmetics': 1,
    'umag_pharmacy': 1,
    // О нас
    'about': 2,
    // Отзывы
    'reviews': 3,
    // Контакты
    'contact': 4,
    'contact_almaty': 4,
    'contact_astana': 4,
    'contact_shymkent': 4,
    'zakaz': 4,
    'zakaz_astana': 4,
    'pismo': 4,
};

let urlLourId = match == null ? 0 : (urlLourList.hasOwnProperty(match) ? urlLourList[match] : 10);

if (urlLourId >= 0 && urlLourId < lourHeaderItems.length) {
    lourHeaderItems[urlLourId].classList.add('active');
}

/* ======================================================================== */
/* CHANGE IMAGES IN - PRODUCTS BOX */

let imgInPCC = document.querySelectorAll('.products_content .products_content_column img');

let aLinksInPBL = document.querySelectorAll('.products_box_list a');

aLinksInPBL.forEach((aLink) => {
    aLink.addEventListener('mouseover', function () {
        let imageUrl = this.getAttribute('data-image');
        if (imageUrl) {
            imgInPCC.forEach((image) => {
                image.style.opacity = "0";
            });
            setTimeout(() => {
                imgInPCC.forEach((image) => {
                    image.src = imageUrl;
                    image.style.opacity = "1";
                });
            }, 150);
        }
    });
});

/* ======================================================================== */
/* SITE MENU RIGHT - HEADER ONLY IN MOBILE */

const globalMenuBtn = document.querySelector('#menu_btn');

const globalCloseBtn = document.querySelector('.close_btn');

const headerLinks = document.querySelector('.loaf_header_links');

// OPEN HEADER MENU
globalMenuBtn.addEventListener('click', () => {
    globalOverlap.style.display = "block";
    globalBody.style.overflow = "hidden";
    setTimeout(() => {
        globalOverlap.style.opacity = "1";
        headerLinks.style.right = "0";
    }, 10);
});

// CLOSE HEADER MENU
function closeHeaderMenu() {
    globalOverlap.style.opacity = "0";
    headerLinks.style.right = "-100%";
    setTimeout(() => {
        globalOverlap.style.display = "none";
        globalBody.style.overflow = "auto";
    }, 200);
}

/* ======================================================================== */
/* SITE MENU LEFT - BURGER MENU */

const burgerBtn = document.querySelector('.burger_btn');

const burgerText = document.querySelector('.burger_text')

const burgerMenu = document.querySelector('.burger_category_menu');

const burgerMenuClose = document.querySelector('.burger_menu_close');

const parentItems = document.querySelectorAll(".burger_category_items");

// OPEN BURGER MENU
burgerBtn.addEventListener('click', () => {
    globalOverlap.style.display = "block";
    globalBody.style.overflow = "hidden";
    burgerText.classList.add('active');
    setTimeout(() => {
        globalOverlap.style.opacity = "1";
        burgerMenu.style.opacity = "1";
        burgerMenu.style.left = "0";
        burgerMenu.style.overflow = "auto";
    }, 10);
});

// CLOSE BURGER MENU
function closeBurgerMenu() {
    if (burgerMenu.style.left === "0px") {
        globalOverlap.style.opacity = "0";
        burgerMenu.style.opacity = "0";
        burgerMenu.style.left = "-" + burgerMenu.offsetWidth + "px";
        burgerMenu.style.overflow = "hidden";
        setTimeout(() => {
            globalOverlap.style.display = "none";
            globalBody.style.overflow = "auto";
            burgerText.classList.remove('active');
        }, 200);
    }
}

// BTN LISTENER CLOSE BURGER MENU
burgerMenuClose.addEventListener('click', closeBurgerMenu);

globalOverlap.addEventListener('click', closeBurgerMenu);

// HIDE OR SHOW SUB CATEGORIES IN BURGER MENU //
parentItems.forEach(parentItem => {
    // DESKTOP MOUSE ENTER/LEAVE
    if (window.innerWidth >= 971) {
        parentItem.addEventListener("mouseenter", function () {
            const submenu = this.querySelector(".burger_category_children");
            submenu.style.maxHeight = submenu.scrollHeight + "px";
        });
        parentItem.addEventListener("mouseleave", function () {
            const submenu = this.querySelector(".burger_category_children");
            submenu.style.maxHeight = null;
        });
    }
    // MOBILE CLICK AND DBLCLICK
    if (window.innerWidth <= 970) {
        let timer = 0;
        let delay = 200;
        parentItem.addEventListener("click", function (event) {
            event.preventDefault();
            const submenu = this.querySelector(".burger_category_children");
            const submenuParent = this.querySelector(".burger_category_parent");
            const submenuArrow = this.querySelector(".burger_category_arrow");
            if (timer) {
                clearTimeout(timer);
                timer = 0;
                window.location = this.querySelector("a").href;
            }
            if (!submenu) {
                window.location = this.querySelector("a").href;
            } else {
                timer = setTimeout(() => {
                    timer = 0;
                    submenu.addEventListener("click", function (event) {
                        event.stopPropagation();
                    });
                    submenu.style.maxHeight = submenu.style.maxHeight ? null : submenu.scrollHeight + "px";
                    this.style.backgroundColor = this.style.backgroundColor ? null : "#3A3B3C59";
                    submenuParent.classList.toggle('active');
                    submenuArrow.classList.toggle('active');
                }, delay);
            }
        });
    }
});

/* ======================================================================== */
/* CHANGE PLACEHOLDER IN SEARCH INPUT */

const searchBoxInput = document.querySelector(".search_box_input");

function changePlaceholder() {
    searchBoxInput.setAttribute("placeholder", window.innerWidth <= 970 ? "Я ищу... " : "Введите запрос... ");
}

changePlaceholder();

window.addEventListener('resize', changePlaceholder);

/* ======================================================================== */
/* CONTACT INFO BLOCK */

const contactInfo = document.querySelector('.contact_info');

const contactDropDown = document.querySelector('.contact_drop_down');

const contactDropDownItems = document.querySelectorAll(".contact_drop_down");

const contactCityNumberLinks = document.querySelectorAll(".contact_city_number a");

// DESKTOP MOUSE ENTER/LEAVE
if (window.innerWidth >= 971) {
    contactInfo.addEventListener("mouseenter", function () {
        contactDropDown.style.display = "block";
        setTimeout(() => {
            contactDropDown.style.opacity = "1";
            contactDropDown.style.transform = "translateY(0)";
        }, 10);
    });
    contactInfo.addEventListener("mouseleave", function () {
        contactDropDown.style.opacity = "0";
        contactDropDown.style.transform = "translateY(-10%)";
        setTimeout(() => {
            contactDropDown.style.display = "none";
        }, 300);
    });
}

// MOBILE CLICK
if (window.innerWidth <= 970) {
    contactInfo.addEventListener('click', () => {
        contactDropDown.style.display = "block";
        globalOverlap.style.display = "block";
        globalOverlap.style.backgroundColor = "#000000D9";
        setTimeout(() => {
            globalOverlap.style.opacity = "1";
            contactDropDown.style.opacity = "1";
            contactDropDown.style.transform = "translateY(10%)";
        }, 10);
    });
    function closeContactModalBlock() {
        globalOverlap.style.opacity = "0";
        contactDropDown.style.opacity = "0";
        contactDropDown.style.transform = "translateY(0)";

        setTimeout(() => {
            contactDropDown.style.display = "none";
            globalOverlap.style.display = "none";
            globalOverlap.style.backgroundColor = "#00000080";
        }, 200);
    }
    globalOverlap.addEventListener('click', closeContactModalBlock);
}

// PHONE COLOR CHANGES WHEN HOVER ON NUMBER
contactDropDownItems.forEach(contactItem => {
    contactItem.addEventListener("mouseover", function () {
        contactCityNumberLinks.forEach(numberLink => {
            numberLink.style.color = "#666";
            numberLink.style.opacity = "0.7";
        });
    });
    contactItem.addEventListener("mouseout", function () {
        contactCityNumberLinks.forEach(numberLink => {
            numberLink.style.color = "#f67c05db";
            numberLink.style.opacity = "1";
        });
    });
});

/* ======================================================================== */
/* TREE LIST PAID (старая)   &&   TREE VIEW LIST (новая) */

function setTreeList(className, iconName) {
    const treeListClassName = document.querySelector('.' + className);
    treeListClassName !== null ? treeListClassName.innerHTML = `
            <li>
                <a href="#">
                    <p><i class="fa ${iconName}" aria-hidden="true"></i> POS системы, моноблоки</p>
                </a>
            </li>
            <li>
                <a href="#">
                    <p><i class="fa ${iconName}" aria-hidden="true"></i> Компьютеры и комплектующие</p>
                </a>
            </li>
            <li>
                <a href="#">
                    <p><i class="fa ${iconName}" aria-hidden="true"></i> Сканеры штрих кодов</p>
                </a>
            </li>
            <li>
                <a href="#">
                    <p><i class="fa ${iconName}" aria-hidden="true"></i> Принтеры чеков и этикеток</p>
                </a>
            </li>
            <li>
                <a href="#">
                    <p><i class="fa ${iconName}" aria-hidden="true"></i> Весы электронные</p>
                </a>
            </li>
            <li>
                <a href="#">
                    <p><i class="fa ${iconName}" aria-hidden="true"></i> Денежные ящики</p>
                </a>
            </li>
            <li>
                <a href="#">
                    <p><i class="fa ${iconName}" aria-hidden="true"></i> Терминалы сбора данных</p>
                </a>
            </li>
            <li>
                <a href="#">
                    <p><i class="fa ${iconName}" aria-hidden="true"></i> Счетчики и детекторы банкнот</p>
                </a>
            </li>
            <li>
                <a href="#">
                    <p><i class="fa ${iconName}" aria-hidden="true"></i> Антикражное оборудование</p>
                </a>
            </li>
        ` : null;
}

setTreeList('tree-list-pad', 'fa-caret-right');

setTreeList('tree_view_list', 'fa-angle-right');

/* ======================================================================== */
/* OPACITY IN BREAD CRUMBS */

let breadCrumbs = document.querySelector(".bread_crumbs");

if (breadCrumbs) {
    let lastBreadCrumb = breadCrumbs.lastElementChild;
    const penultimateBreadcrumb = lastBreadCrumb.previousElementSibling;
    lastBreadCrumb.style.opacity = "0";
    penultimateBreadcrumb.style.opacity = "0";
    document.addEventListener("DOMContentLoaded", function() {
        setTimeout(function() {
            lastBreadCrumb.style.transition = "opacity 1s";
            lastBreadCrumb.style.opacity = "1";
            penultimateBreadcrumb.style.transition = "opacity 1s";
            penultimateBreadcrumb.style.opacity = "1";
        }, 100);
    });
}

/* ======================================================================== */
/* OPEN CLOSED SORT PRICE MODAL */

let sortingCrumbs = document.querySelector('.sorting_crumbs');

let sortingCrumbsTitle = document.querySelector('.sorting_crumbs_title');

let previousSelectedItem = null;

if (sortingCrumbs) {
    document.addEventListener('click', function (event) {
        const isClickInside = sortingCrumbs.querySelector('.sorting_crumbs_select').contains(event.target);
        if (!isClickInside) {
            if (sortingCrumbs.querySelector('.sorting_crumbs_select.active')) {
                sortingCrumbs.querySelector('.sorting_crumbs_select.active').classList.remove('active');
                sortingCrumbs.querySelector('.sorting_option').style.display = 'none';
            }
        }
    });
    sortingCrumbs.querySelectorAll('.sorting_crumbs_select').forEach(function (sortingCrumbsSelect) {
        sortingCrumbsSelect.addEventListener('click', function () {
            this.classList.toggle('active');
            this.querySelector('.sorting_option').style.display = (this.querySelector('.sorting_option').style.display === 'block') ? 'none' : 'block';
        });
        sortingCrumbsSelect.querySelectorAll('.sorting_option li').forEach(function (item) {
            item.addEventListener('click', function () {
                const sortingCrumbsSelect = this.closest('.sorting_crumbs_select');
                sortingCrumbsSelect.querySelector('span').textContent = this.textContent;
                if (previousSelectedItem && previousSelectedItem !== item) {
                    previousSelectedItem.classList.remove('selected');
                }
                item.classList.add('selected');
                previousSelectedItem = item;
            });
        });
    });
}

if (window.innerWidth <= 970 && sortingCrumbsTitle) {
    sortingCrumbsTitle.innerHTML = '<i class="fa fa-sort" aria-hidden="true"></i>';
}

/* ======================================================================== */
/* OPEN FILTER NAV IN MOBILE */

if (window.innerWidth <= 970) {
    const filterCrumbs = document.querySelector('.filter_crumbs');
    const filterNav = document.querySelector('.filter_nav');

    if (filterCrumbs && filterNav) {
        const scrollY = window.scrollY;
        const openFilterNavMenu = () => {
            globalBody.style.overflow = "hidden";
            globalOverlap.style.display = "block";
            filterNav.style.overflow = "auto";

            globalBody.style.position = 'fixed';
            globalBody.style.width = '100%';
            globalBody.style.top = -scrollY + 'px';
            setTimeout(() => {
                globalOverlap.style.opacity = "0.3";
                filterNav.style.left = "0%";
                filterNav.style.opacity = "1";
            }, 10);
        };
        const closeFilterNavMenu = () => {
            globalOverlap.style.opacity = "0";
            filterNav.style.left = "-100%";
            filterNav.style.opacity = "0";
            setTimeout(() => {
                globalBody.style.overflow = "auto";
                globalOverlap.style.display = "none";
                filterNav.style.overflow = "hidden";

                globalBody.style.position = '';
                globalBody.style.width = '';
                globalBody.style.top = '';
                window.scrollTo(0, scrollY);
            }, 200);
        };
        filterCrumbs.addEventListener('click', openFilterNavMenu);
        globalOverlap.addEventListener('click', closeFilterNavMenu);
    }
}

/* ======================================================================== */
/* Добавляет цену в категориях */

if (document.querySelector('.product-items') != null) {
    let mainLength = document.querySelectorAll('.main');
    for (let index = 0; index < mainLength.length; index++) {
        for (let j = 0; j < data5.length; j++) {
            let mainLengthLink = mainLength[index].children[0].href.split('/').pop().split('#')[0].split('?')[0];
            if (mainLengthLink == data5[j].link) {
                let formatter = function (priceSum) {
                    let mn = 0;
                    let price = priceSum.toString();
                    for (let ij = price.length; ij > 0; ij--) {
                        if (mn % 3 == 0) {
                            price = [price.slice(0, ij), ' ', price.slice(ij)].join('');
                        }
                        mn++;
                    }
                    return price;
                };
                mainLength[index].children[0].innerHTML += `
                    <div class="search-price-container2">
                        <span class="search-price">${formatter(data5[j].price)} <span class="tenge_logo">₸</span> </span>
                    </div>
                `;
                mainLength[index].children[1].innerHTML = `
                    <p>
                    <span class="item-price-indicator_second">Цена:</span>
                    <br> 
                    <span class="item_price_second">${formatter(data5[j].price,)} <span class="tenge_logo">₸</span> </span>
                    </p>
                    <a class="hvr-outline-out button2" href="${data5[j].link}">Перейти</a>
                `;
                break;
            }
        }
    }
}