/**
 * MLNUI Messagebox
 */
$.MLNUI.Files['Messagebox'] = 'loaded';
$.MLNUI.Messagebox = $.Class({
    Button: {
        OK:'_ok_button',
        CANCEL:'_cancel_button',
        YES:'_yes_button',
        NO:'_no_button'
    },
    prototype: {
        init: function() {

        },
        Alert: function(msg) {
            var title = arguments[1] || '提示信息';
            var parent = arguments[2] || '';
            var func = arguments[3] || $.emptyFn;
            var ButtonGroup=[new $.MLNUI.Button({
                text:'确定',
                type:$.MLNUI.Messagebox.Button.OK
            })];
                     
            var modelWindow = new $.MLNUI.Window({
                parent: parent,
                isModel: true,
                isResize:false,
                hasCloseButton: true,
                title: title,
                content: msg,
                bottomButtons: ButtonGroup
            });
            modelWindow.show();
            $(ButtonGroup[0]).bind('MOUSE_CLICK', function(e) {
                modelWindow.close();
                func.apply(modelWindow,[this.options.type]);
            });
            $(modelWindow.closeButton).bind('click', function(e) {
                func.apply(modelWindow,[$.MLNUI.Messagebox.Button.CANCEL]);
            });
            return modelWindow;
        },
        Confirm: function(msg) {
            var title = arguments[1] || '确认信息';
            var parent = arguments[2] || '';
            var func = arguments[3] || $.emptyFn;
            var ButtonGroup=[new $.MLNUI.Button({
                text:'确定',
                type:$.MLNUI.Messagebox.Button.YES
            }),new $.MLNUI.Button({
                text:'取消',
                type:$.MLNUI.Messagebox.Button.NO
            })];
            
            var modelWindow = new $.MLNUI.Window({
                parent: parent,
                isModel: true,
                isResize:false,
                hasCloseButton: true,
                title: title,
                content: msg,
                bottomButtons: ButtonGroup
            });
            modelWindow.show();
            $(ButtonGroup).bind('MOUSE_CLICK', function(e) {
                modelWindow.close();
                func.apply(modelWindow,[this.options.type]);
            });
            $(modelWindow.closeButton).bind('click', function(e) {
                func.apply(modelWindow,[$.MLNUI.Messagebox.Button.NO]);
            });
        }
    }
});
$.MLNUI.Msg=$.Class({
    Button: {
        OK:'_ok_button',
        CANCEL:'_cancel_button',
        YES:'_yes_button',
        NO:'_no_button'
    },
    Alert: function(msg) {
        return (new $.MLNUI.Messagebox()).Alert(msg,arguments[1],arguments[2],arguments[3]);
    },
    Confirm: function(msg) {
        return (new $.MLNUI.Messagebox()).Confirm(msg,arguments[1],arguments[2],arguments[3]);
    },
    prototype: {
        init: function() {

        }
    }
});