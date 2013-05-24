/**
 * MLNUI Panel
 */
$.MLNUI.Files['Panel'] = 'loaded';
$.MLNUI.Panel = $.Class({
    prototype: {
        defaultOpts: {
            parent: '',
            minWidth: 250,
            title: 'Title Bar',
            content: 'Contents',
            hasCloseButton: false,
            hasMinButton: false,
            hasMaxButton: false,
            titleButtons: [],
            userClass: '',
            onClose: $.emptyFn
        },
        options: {},
        init: function(opts) {
            this.options = $.extend(true, {}, this.defaultOpts, opts);
            this.parent = ($(this.options.parent).length <= 0) ? 'body' : this.options.parent;
            this.initEl();
        },
        titleButtons: [],
        cloneEl: null,
        initEl: function() {
            var _this = this;
            this.panelEl = document.createElement('div');
            $(this.panelEl).addClass('ui-panel ' + this.options.userClass).click( function(e) {
                $(_this).trigger('focus');
            });
            this.panelHead = $('<div class="ui-panel-tl ui-unselectable"><div class="ui-panel-tr"><div class="ui-panel-tc"><div class="ui-panel-title"></div><div class="ui-panel-w-button"></div></div></div></div>').appendTo(this.panelEl);
            this.panelMiddle = $('<div class="ui-panel-ml"><div class="ui-panel-mr"><div class="ui-panel-mc"><div class="ui-panel-c"><div class="ui-panel-con"></div></div><div class="ui-panel-button"></div></div></div></div>').appendTo(this.panelEl);
            this.panelBottom = $('<div class="ui-panel-bl"><div class="ui-panel-br"><div class="ui-panel-bc"></div></div></div>').appendTo(this.panelEl);
            this.panelHeadButton = $('<div><span></span></div>')
            this.panelHeadButton.find('span').bind({
                mouseover: function(e) {
                    e.stopImmediatePropagation();
                    $(this).fadeTo("fast", 1);
                },
                mouseout: function(e) {
                    $(this).fadeTo("fast", 0);
                },
                mousedown: function(e) {
                    e.stopImmediatePropagation();
                },
                mouseup: function(e) {
                    e.stopImmediatePropagation();
                }
            });
            $(this).bind({
                BEFORE_RENDER: function(e) {
                    if ($(e.target.panelEl).width() < e.target.options.minWidth) {
                        $(e.target.panelEl).width(e.target.options.minWidth);
                    }
                },
                AFTER_RENDER: function(e) {
                    if (this.cloneEl == null) {
                        _this.cloneEl = $(e.target.panelEl).clone(true, true);
                    }
                }
            });
            if (this.options.hasCloseButton) {
                _this.closeButton = _this.addHeadButton('ui-panel-w-close', '关闭', this.onClose);
            }
            if (this.options.hasMinButton) {
                _this.minButton = _this.addHeadButton('ui-panel-w-min', '最小化', this.onMin);
            }
            if (this.options.hasMaxButton) {
                _this.maxButton = _this.addHeadButton('ui-panel-w-max', '最大化', this.onMax);
            }
            $(this.options.titleButtons).each( function() {
                _this.addHeadButton(this.c, this.title, this.handler);
            });
        },
        addHeadButton: function(c, title, handler) {
            var _this = this;
            var newPanelHeadButton = this.panelHeadButton.clone(true, true);
            $(newPanelHeadButton).addClass(c).prependTo(this.panelHead.find('.ui-panel-w-button')).find('a').attr('title', title);
            $(newPanelHeadButton).addClass(c);
            $(newPanelHeadButton).find('span').attr('title', title).css({
                "opacity": 0,
                "display": "block"
            }).bind({
                click: function(e) {
                    $(newPanelHeadButton).trigger('CLICK');
                    handler.apply(_this);
                }
            });
            this.titleButtons.push(newPanelHeadButton);
            this.panelHead.find('.ui-panel-w-button>div').css('opacity', 1);
            return newPanelHeadButton;
        },
        onClose: function() {
            $(this).trigger('BEFORE_CLOSE');
            $(this.panelEl).remove();
            this.options.onClose.apply(this);
            $(this).trigger('AFTER_CLOSE');
        },
        onMin: function() {
            $(this).trigger('BEFORE_MIN');
            $(this.panelMiddle).find('.ui-panel-mc').slideToggle('fast');
            this.options.onMin.apply(this);
            $(this).trigger('AFTER_MIN');
        },
        onMax: function() {
            $(this).trigger('BEFORE_MAX');
            this.options.onMax.apply(this);
        },
        render: function() {
            var _this = this;
            this.parent = arguments[0] || this.parent;
            $(this).trigger('BEFORE_RENDER');
            if (this.cloneEl == null) {
                this.panelHead.find('.ui-panel-title').html(this.options.title);
                this.panelMiddle.find('.ui-panel-con').html(this.options.content);
            } else {
                this.panelEl = $(this.cloneEl).clone(true, true);
            }
            $(this.parent).append(this.panelEl);
            $(this).trigger('AFTER_RENDER');
        }
    }
});