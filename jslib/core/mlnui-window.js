/**
 * MLNUI Window
 */
$.MLNUI.Files['Window'] = 'loaded';
$.MLNUI.Window = $.MLNUI.Panel.extend({
    prototype: {
        defaultOpts: {
            parent: '',
            minWidth: 250,
            title: 'Title Bar',
            content: 'Contents',
            isModel: false,
            isDragable: true,
            isResize:true,
            hasCloseButton: true,
            hasMinButton: false,
            hasMaxButton: false,
            titleButtons: [],
            bottomButtons: [],
            userClass: '',
            onClose: $.emptyFn
        },
        model: null,
        init: function(opts) {
            var _this = this;
            this._parent(opts);
            this.parentWin = (this.parent == 'body') ? window : this.options.parent;
            this.parentModel = (this.parent == 'body') ? document : this.options.parent;
            this.ptop=(_this.parentWin==window)?0:$(_this.parentWin).offset().top;
            this.pleft=(_this.parentWin==window)?0:$(_this.parentWin).offset().left;
            this.container=this.panelEl;
            if (this.options.isModel) {
                this.model = new $.MLNUI.Model({
                    parent: this.parentModel,
                    alwayMiddle: false
                });
                this.model.addItems(this);
                this.container=this.model.model;
            }
            if ($($.MLNUI.WinManager.windowData).length > 0) {
                var tmpSort = [];
                $($.MLNUI.WinManager.windowData).each( function() {
                    tmpSort.push(this.zindex);
                });
                tmpSort.sort($.MLNUI.compareInt);
                maxTmp = tmpSort.pop();
                $(this.panelEl).css('z-index', maxTmp + 1);
                $.MLNUI.WinManager.windowData.push({
                    win: this,
                    zindex: maxTmp + 1
                });
            } else {
                tmpSort = $.MLNUI.WinManager.modelZindexs.clone();
                tmpSort.sort($.MLNUI.compareInt);
                maxTmp = parseInt(tmpSort.pop()) || 1;
                $.MLNUI.WinManager.windowData.push({
                    win: this,
                    zindex: maxTmp + 1
                });
            }
            _this.windowIndex = $.MLNUI.WinManager.windowData.length - 1;
            $(this).bind('focus', function(e) {
                var tmpSort = [];
                var tmpWinData = [];
                $($.MLNUI.WinManager.windowData).each( function() {
                    tmpSort.push(this.zindex);
                });
                tmpSort.sort($.MLNUI.compareInt);
                maxTmp = tmpSort.pop();
                $(this.panelEl).css('z-index', maxTmp + 1);
                $($.MLNUI.WinManager.windowData).each( function(i) {
                    if (this.win == _this) {
                        $.MLNUI.WinManager.windowData[i]['zindex'] = maxTmp + 1;
                        _this.windowIndex = i;
                        return false;
                    }
                });
            })
            $(window).resize( function(e) {
                _this.dragHandler.regetArea();
                tmpArea= {
                    top:_this.panelHead.height()+_this.btnBarHeight-_this.panelBottom.height(),
                    left:_this.options.minWidth,
                    height:$(_this.parentWin).height()+$(_this.parentWin).scrollTop()-$(_this.container).offset().top+_this.ptop-(_this.panelHead.height()+_this.btnBarHeight-_this.panelBottom.height())-1,
                    width:
                    $(_this.parentWin).width()-$(_this.container).offset().left+_this.pleft-(_this.options.minWidth)-1
                };
                _this.resizeDragHandler.setArea(tmpArea);
            });
        },
        initEl: function() {
            var _this=this;
            this._parent();
            this.bottomButtonBar = new $.MLNUI.Toolbar();
            this.bottomButtonBar.render(this.panelMiddle.find('.ui-panel-button'));
            this.parentWin=(this.parent == 'body') ? window : this.options.parent;
            if(this.options.isResize) {
                this.resizeHandler=$('<div></div>').addClass('ui-resize-handler');
                this.panelMiddle.find('.ui-panel-mc').append(this.resizeHandler);
                $(this).bind('AFTER_SHOW', function(e) {
                    _this.resizeHandler.css({
                        top:$(_this.panelEl).height()-6,
                        left:$(_this.panelEl).width()-6
                    });
                    _this.btnBarHeight=_this.panelMiddle.find('.ui-panel-button').height();
                    _this.resizeDragHandler = new $.MLNUI.Drag(_this.resizeHandler, {
                        handler: _this.resizeHandler,
                        area: {
                            top:_this.panelHead.height()+_this.btnBarHeight-_this.panelBottom.height(),
                            left:_this.options.minWidth,
                            height:$(_this.parentWin).height()+$(_this.parentWin).scrollTop()-$(_this.container).offset().top+_this.ptop-(_this.panelHead.height()+_this.btnBarHeight-_this.panelBottom.height())-1,
                            width:$(_this.parentWin).width()-$(_this.container).offset().left+_this.ptop-(_this.options.minWidth)-1
                        }
                    });
                    $(_this.resizeDragHandler).bind({
                        'ON_DRAG': function(e) {
                            _this.panelMiddle.find('.ui-panel-c').height($(this.dragDom).position().top-_this.panelHead.height()-_this.panelBottom.height()-_this.btnBarHeight+6);
                            $(_this.panelEl).width($(this.dragDom).position().left+6);
                            $(_this.panelEl).css('cursor','nw-resize');
                            $('body').css('cursor','nw-resize');
                        },
                        'DROPED': function(e) {
                            $(_this.panelEl).css('cursor','default');
                            $('body').css('cursor','default');
                            _this.dragHandler.regetArea();
                        }
                    })
                });
            }
        },
        render: function() {
            var _this = this;
            this.parent = arguments[0] || this.parent;
            this._parent(this.parent);
            $(this.options.bottomButtons).each( function() {
                _this.bottomButtonBar.rightAdd(this);
            });
        },
        show: function() {
            var _this=this;
            if (this.options.isModel) {
                this.model.show();
                $(this).trigger('AFTER_SHOW');
                if (this.options.isDragable) {
                    this.dragHandler = new $.MLNUI.Drag(this.container, {
                        handler: this.panelHead,
                        parent: this.parentWin
                    });
                    this.dragHandler.regetArea();
                }
            } else {
                $(this.panelEl).css({
                    'opacity': 0
                });
                this.render();
                if (this.options.isDragable) {
                    this.dragHandler = new $.MLNUI.Drag(this.container, {
                        handler: this.panelHead,
                        parent: this.parentWin
                    });
                    this.dragHandler.regetArea();
                }
                $(this).trigger('AFTER_SHOW');
                var oldPositionTop = $(this.panelEl).position().top;
                $(this.panelEl).css({
                    'top': oldPositionTop - 100
                }).animate({
                    opacity: 1,
                    top: oldPositionTop
                }, 200);
            }
            $(this.dragHandler).bind({
                'DROPED': function(e) {
                    tmpArea= {
                        top:_this.panelHead.height()+_this.btnBarHeight-_this.panelBottom.height(),
                        left:_this.options.minWidth,
                        height:$(_this.parentWin).height()+$(_this.parentWin).scrollTop()-$(_this.container).offset().top+_this.ptop-(_this.panelHead.height()+_this.btnBarHeight-_this.panelBottom.height())-1,
                        width:$(_this.parentWin).width()-$(_this.container).offset().left+_this.pleft-(_this.options.minWidth)-1
                    };
                    _this.resizeDragHandler.setArea(tmpArea);
                }
            });
        },
        close: function() {
            this.onClose();
        },
        onClose: function() {
            $(this).trigger('BEFORE_CLOSE');
            var _this = this;
            if (this.options.isModel) {
                this.model.close();
            } else {
                var oldPositionTop = $(this.panelEl).position().top;
                $(this.panelEl).animate({
                    opacity: 0,
                    top: oldPositionTop + 100
                }, 200, function() {
                    _this.options.onClose.apply(_this);
                    $(_this.panelEl).remove();
                });
            }
            $.MLNUI.WinManager.windowData.splice(this.windowIndex, 1);
            $(this).trigger('AFTER_CLOSE');
        }
    }
});