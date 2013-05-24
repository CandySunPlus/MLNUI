/**
 * MLNUI Button
 */
$.MLNUI.Files['Button'] = 'loaded';
$.MLNUI.ButtonType = {
    'TEXT': 'ui-button-text',
    'IMGONLY': 'ui-button-img',
    'IMGTEXT': 'ui-button-imgtext'
};
$.MLNUI.Button = $.Class({
    prototype: {
        defaultOpts: {
            text: 'Button',
            width: 60,
            height: null,
            type: $.MLNUI.ButtonType.TEXT,
            userClass: ''
        },
        cloneEl: null,
        options: {},
        init: function(opts) {
            this.options = $.extend(true, {}, this.defaultOpts, opts);
            this.initEl();
        },
        initEl: function() {
            var _this = this;
            this.btnEl = $('<table class="ui-table-layout ui-btn" cellspacing="0"><tr><td class="ui-btn-tl"><i></i></td><td class="ui-btn-tc"></td><td class="ui-btn-tr"><i></i></td></tr><tr><td class="ui-btn-ml"><i></i></td><td class="ui-btn-mc"><em><button type="button"></button></em></td><td class="ui-btn-mr"><i></i></td></tr><tr><td class="ui-btn-bl"><i></i></td><td class="ui-btn-bc"></td><td class="ui-btn-br"><i></i></td></tr></table>').addClass('ui-btn-normal ' + this.options.userClass);
            this.btnBorderTopHeight = this.btnEl.find('.ui-btn-tl>i').height();
            this.btnBorderBottomHeight = this.btnEl.find('.ui-btn-bl>i').height();
            this.btnBorderLeftWidth = this.btnEl.find('.ui-btn-ml>i').width();
            this.btnBorderRightWidth = this.btnEl.find('.ui-btn-mr>i').width();
            this.width = (this.options.width == null) ? 'auto' : this.options.width - this.btnBorderLeftWidth - this.btnBorderRightWidth;
            this.height = (this.options.height == null) ? 'inhert' : this.options.height - this.btnBorderTopHeight - this.btnBorderBottomHeight;
            this.btnEl.find('button').addClass(this.options.type).css({
                'width': this.width,
                'height': this.height
            });
            this.btnEl.bind({
                'mouseover': function() {
                    if (!$(this).hasClass('ui-btn-hover'))
                        $(this).removeClass('ui-btn-normal').addClass('ui-btn-hover');
                    $(_this).trigger('MOUSE_OVER');
                },
                'mouseout': function() {
                    if (!$(this).hasClass('ui-btn-normal'))
                        $(this).removeClass('ui-btn-hover ui-btn-press').addClass('ui-btn-normal');
                    $(_this).trigger('MOUSE_OUT');
                },
                'mousedown': function(e) {
                    if (e.button != $.MLNUI.Mouse.LB) {
                        return false;
                    }
                    e.stopImmediatePropagation();
                    if (!$(this).hasClass('ui-btn-press'))
                        $(this).removeClass('ui-btn-hover ui-btn-normal').addClass('ui-btn-press');
                    $(_this).trigger('MOUSE_DOWN');
                },
                'mouseup': function(e) {
                    if (e.button != $.MLNUI.Mouse.LB) {
                        return false;
                    }
                    e.stopImmediatePropagation();
                    if (!$(this).hasClass('ui-btn-hover'))
                        $(this).removeClass('ui-btn-hover ui-btn-press').addClass('ui-btn-hover');
                    $(_this).trigger('MOUSE_UP');
                },
                'mousemove': function(e) {
                    e.stopImmediatePropagation();
                },
                'click': function(e) {
                    if (e.button != 0) {
                        return false;
                    }
                    $(_this).trigger('MOUSE_CLICK');
                }
            });
            $(this).bind({
                'AFTER_RENDER': function(e) {
                    _this.cloneEl = $(_this.btnEl).clone(true, true);
                }
            });
        },
        render: function() {
            var _this = this;
            this.parent = arguments[0] || 'body';
            $(this).trigger('BEFORE_RENDER');
            if (this.cloneEl != null) {
                this.btnEl = $(this.cloneEl).clone(true, true);
            } else {
                this.btnEl.find('button').text(this.options.text);
            }
            $(this.parent).append(this.btnEl);
            $(this).trigger('AFTER_RENDER');
        }
    }
});