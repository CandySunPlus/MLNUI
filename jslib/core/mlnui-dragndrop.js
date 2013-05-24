/**
 * MLNUI Drag and drop class
 */
$.MLNUI.Files['dragAndDrop'] = 'loaded';
$.MLNUI.Drag = $.Class({
    prototype: {
        defaultOpts: {
            handler: '.ui-drag-handler',
            parent: '',
            mouseButton: $.MLNUI.Mouse.LB,
            opacity: 0.8,
            area:null
        },
        init: function(selector, opts) {
            this.options = $.extend(true, {}, this.defaultOpts, opts);
            var _this = this;
            $(selector).each( function() {
                _this.dragDom=this;
                var handler = ($(_this.options.handler).length <= 0) ? this : _this.options.handler;
                _this.parent = ($(_this.options.parent).length <= 0 || _this.options.parent == document || _this.options.parent == window) ? window : _this.options.parent;
                if (_this.parent == window) {
                    _this.minTop = 0;
                    _this.minLeft = 0;
                } else {
                    _this.minTop = $(_this.parent).offset().top;
                    _this.minLeft = $(_this.parent).offset().left;
                }
                _this.maxTop = _this.minTop + $(_this.parent).height()+$(_this.parent).scrollTop() - $(this).height();
                _this.maxLeft = _this.minLeft + $(_this.parent).width()+$(this.parent).scrollLeft() - $(this).width();
                if(_this.options.area!=null) {
                    _this.minTop = _this.options.area.top;
                    _this.minLeft = _this.options.area.left;
                    _this.maxTop = _this.minTop + _this.options.area.height - $(this).height();
                    _this.maxLeft = _this.minLeft + _this.options.area.width - $(this).width();
                }
                if ($(this).css('position') != 'absolute') {
                    try {
                        target.position(oldCss);
                    } catch (ex) {
                    }
                    $(this).css({
                        position: 'absolute',
                        top: (_this.maxTop - _this.minTop) / 2,
                        left: (_this.maxLeft - _this.minLeft) / 2
                    });
                }
                $(handler).bind('mousedown', {
                    target: this
                }, function(e) {
                    if (e.button != _this.options.mouseButton) {
                        return false;
                    }
                    var target = $(e.data.target);
                    var oldCss = {};
                    oldCss.opacity = 1;
                    var dragData = {
                        options: _this.options,
                        instance: _this,
                        left: oldCss.left || target.position().left,
                        top: oldCss.top || target.position().top,
                        width: target.width(),
                        height: target.height(),
                        offLeft: e.pageX,
                        offTop: e.pageY,
                        oldCss: oldCss,
                        handler: $(this),
                        target: target
                    }
                    if ($(handler).get(0).setCapture) {
                        target.find('.ui-panel-w-button>div').css('opacity', 1);
                        $(handler).get(0).setCapture();
                    }
                    $(document).bind('mousemove', {
                        dragData: dragData
                    }, _this.drag).bind('mouseup', {
                        dragData: dragData
                    }, _this.drop).bind('selectstart', function(e) {
                        e.preventDefault();
                    });
                });
            });
        },
        setArea: function(areaObj) {
            this.options.area=areaObj;
            this.minTop = this.options.area.top;
            this.minLeft = this.options.area.left;
            this.maxTop = this.minTop + this.options.area.height - $(this.dragDom).height();
            this.maxLeft = this.minLeft + this.options.area.width - $(this.dragDom).width();
        },
        regetArea: function() {
            if (this.parent == window) {
                this.minTop = 0;
                this.minLeft = 0;
            } else {
                this.minTop = $(this.parent).offset().top;
                this.minLeft = $(this.parent).offset().left;
            }
            this.maxTop = this.minTop + $(this.parent).height()+$(this.parent).scrollTop() - $(this.dragDom).height();
            this.maxLeft = this.minLeft + $(this.parent).width()+$(this.parent).scrollLeft() - $(this.dragDom).width();
        },
        drag: function(e) {
            var dragData = e.data.dragData;
            dragData.target.css({
                opacity: dragData.options.opacity,
                left: Math.min(Math.max(dragData.instance.minLeft, dragData.left + e.pageX - dragData.offLeft), dragData.instance.maxLeft),
                top: Math.min(Math.max(dragData.instance.minTop, dragData.top + e.pageY - dragData.offTop), dragData.instance.maxTop)
            });
            dragData.handler.addClass('ui-cursor-move');
            $(dragData.instance).trigger('ON_DRAG');
        },
        drop: function(e) {
            var dragData = e.data.dragData;
            dragData.target.css(dragData.oldCss);
            $(document).unbind('mousemove', this.drag).unbind('mouseup', this.drop);
            if (dragData.handler.get(0).releaseCapture) {
                dragData.handler.get(0).releaseCapture();
            }
            dragData.handler.removeClass('ui-cursor-move');
            $(dragData.instance).trigger('DROPED');
        }
    }
});