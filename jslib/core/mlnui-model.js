/**
 * MLNUI Model
 */
$.MLNUI.Files['Model'] = 'loaded';
$.MLNUI.Model = $.Class({
    prototype: {
        defaultOpts: {
            level: null,
            parent: '',
            opacity: 0.8,
            items: [],
            alwayMiddle: true,
            userClass: ''
        },
        init: function(opts) {
            this.options = $.extend(true, {}, this.defaultOpts, opts);
            this.items = this.options.items;
            this.parent = ($(this.options.parent).length <= 0) ? document : this.options.parent;
            this.winParent = ($(this.options.parent).length <= 0 || this.options.parent == document) ? window : this.options.parent;                
            this.model = document.createElement('div');
            $.MLNUI.WinManager.modelZindexs.sort($.MLNUI.compareInt);
            var tmpSort = [];
            $($.MLNUI.WinManager.windowData).each( function() {
                tmpSort.push(this.zindex);
            });
            tmpSort.sort($.MLNUI.compareInt);
            maxTmp = tmpSort.pop() || 1;
            if (this.options.level == null) {
                this.options.level = ($.MLNUI.WinManager.modelZindexs.length <= 0) ? maxTmp : $.MLNUI.WinManager.modelZindexs[$.MLNUI.WinManager.modelZindexs.length - 1] + 2;
            }
            $.MLNUI.WinManager.modelZindexs.push(this.options.level);        
        },
        items: [],
        options: {},
        show: function() {
            this.showMask();
        },
        initMask: function() {
            var _this = this;
            this.maskIndex = -1;
            var _maskW = $(this.parent).width();
            var _maskH = $(this.parent).height();
            var _maskTop = (this.parent == document) ? 0 : $(this.parent).offset().top;
            var _maskLeft = (this.parent == document) ? 0 : $(this.parent).offset().left;
            $($.MLNUI.WinManager.maskData).each( function(i) {
                if (this.parent == _this.parent) {
                    _this.maskIndex = i;
                    return false;
                }
            });
            if (this.maskIndex >= 0) {
                this.mask = $.MLNUI.WinManager.maskData[this.maskIndex].mask;
                this.mask_iframe = $.MLNUI.WinManager.maskData[this.maskIndex].mask_iframe;
                $(this.mask).css({
                    'top': _maskTop,
                    'left': _maskLeft
                }).addClass('ui-mask ' + this.options.userClass).hide().width(_maskW).height(_maskH);
                $(this.mask_iframe).css({
                    'top': _maskTop,
                    'left': _maskLeft
                }).hide().width(_maskW).height(_maskH);
                this.setMaskZindex(this.options.level);
            } else {
                this.mask = document.createElement('div');
                this.mask_iframe = document.createElement('iframe');
                $(this.mask).css({
                    'z-index': this.options.level,
                    'scrolling': 'no',
                    'top': _maskTop,
                    'left': _maskLeft
                }).addClass('ui-mask ' + this.options.userClass).hide().width(_maskW).height(_maskH);
                $(this.mask_iframe).attr({
                    'frameborder': 0,
                    'src': 'about:blank'
                }).css({
                    'position': 'absolute',
                    'opacity': 0,
                    'z-index': this.options.level - 1,
                    'scrolling': 'no',
                    'top': _maskTop,
                    'left': _maskLeft
                }).width(_maskW).height(_maskH);
                $('body').append(this.mask_iframe).append(this.mask);
                $.MLNUI.WinManager.maskData.push({
                    mask: this.mask,
                    mask_iframe: this.mask_iframe,
                    parent: this.parent,
                    zindex: this.options.level,
                    preZindex: []
                });
                this.maskIndex = $($.MLNUI.WinManager.maskData).length - 1;
            }
            $(window).bind('resize', function() {
                var _maskW = $(_this.parent).width();
                var _maskH = $(_this.parent).height();
                $(_this.mask).width(_maskW).height(_maskH);
                $(_this.mask_iframe).width(_maskW).height(_maskH);
                $(_this).trigger('RESIZE');
            });
            

        },
        showMask: function() {
            var _this = this;
            this.initMask();
            this.initModel();
            $(this).trigger('BEFORE_MASK');
            $(this.mask).fadeTo(100, this.options.opacity, function() {
                $(_this.mask).click( function(e) {
                    $(_this).trigger('CLICK_MASK');
                });
                $(this).trigger('AFTER_MASK');
                $(this).trigger('BEFORE_MODEL');
                _this.showModel();
                $(this).trigger('AFTER_MODEL');
            });
        },
        setMaskZindex: function(zindex) {
            $(this.mask).css('z-index', zindex);
            $(this.mask_iframe).css('z-index', zindex - 1);
            this.options.level = zindex;
            if (arguments[1] != true) {
                $.MLNUI.WinManager.maskData[this.maskIndex].preZindex.push($.MLNUI.WinManager.maskData[this.maskIndex].zindex);
            }
            $.MLNUI.WinManager.maskData[this.maskIndex].zindex = this.options.level;
            $(this).trigger('MASK_ZINDEX');
        },
        closeMask: function() {
            var _this = this;
            if ($.MLNUI.WinManager.maskData[this.maskIndex].preZindex.length <= 0) {
                $.MLNUI.WinManager.maskData.splice(this.maskIndex, 1);
                $(this).trigger('MASK_B_CLOSED');
                $(this.mask).fadeOut('fast', function() {
                    $(_this.mask).remove();
                    $(_this.mask_iframe).remove();
                    $(_this).trigger('MASK_CLOSED');
                });
            } else {
                var preZindex = $.MLNUI.WinManager.maskData[this.maskIndex].preZindex.pop();
                $(this).trigger('MASK_B_CLOSED');
                this.setMaskZindex(preZindex, true);
                $(this).trigger('MASK_CLOSED');
            }
        },
        setModelPos: function() {
            var _winMidX = $(this.winParent).width() / 2;
            var _winMidY = $(this.winParent).height() / 2;
            if (this.winParent == window) {
                this.modelX = _winMidX - ($(this.model).width() / 2) + $(window).scrollLeft();
                this.modelY = _winMidY - ($(this.model).height() / 2) + $(window).scrollTop();
            } else {
                this.modelX = _winMidX - ($(this.model).width() / 2);
                this.modelY = _winMidY - ($(this.model).height() / 2);
            }
            $(this.model).css({
                top: this.modelY,
                left: this.modelX
            });
        },
        addItems: function(item) {
            this.items.push(item);
        },
        initModel: function() {
            var _this = this;
            $(this.items).each( function() {
                this.render(_this.model);
            });
            $(this.model).addClass('ui-model').css({
                'z-index': this.options.level + 1,
                'opacity': 0
            }).click( function(e) {
                $(_this).trigger('CLICK_MODEL');
            });
            $('body').append(this.model);
            this.setModelPos();
            $(this).bind('RESIZE', {
                me: this
            }, function(e) {
                if (_this.options.alwayMiddle) {
                    e.data.me.setModelPos();
                }
            });
        },
        showModel: function() {
            $(this.model).css('top', $(this.model).position().top - 100).animate({
                opacity: 1,
                top: this.modelY
            }, 200);
        },
        close: function() {
            var _this = this;
            $(this.model).animate({
                opacity: 0,
                top: $(this.model).position().top + 100
            }, 200, function() {
                $(_this.model).remove();
                $.MLNUI.WinManager.modelZindexs.sort($.MLNUI.compareInt);
                $.MLNUI.WinManager.modelZindexs.pop();
            });
            this.closeMask();
        }
    }
});