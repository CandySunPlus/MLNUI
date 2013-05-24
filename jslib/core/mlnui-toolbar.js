/**
 * MLNUI Toolbar
 */
$.MLNUI.Files['Toolbar'] = 'loaded';
$.MLNUI.Toolbar = $.Class({
	prototype: {
		defaultOpts: {
			userClass: ''
		},
		options: {},
		init: function(opts) {
			this.options = $.extend(true, {}, this.defaultOpts, opts);
			this.initEl();
		},
		cloneEl: null,
		initEl: function() {
			var _this = this;
			this.toolbarEl = $('<div class="ui-toolbar"><table cellspacing="0" class="ui-toolbar-tc"><tr><td class="ui-toolbar-left" align="left"><table cellspacing="0"><tr class="ui-toolbar-left-row"></tr></table></td><td class="ui-toolbar-right" align="right"><table cellspacing="0"><tr class="ui-toolbar-right-row"></tr></table></td></tr></table></div>').addClass(this.options.userClass);
			$(this).bind({
				'AFTER_RENDER': function(e) {
					_this.cloneEl = $(_this.toolbarEl).clone(true, true);
				}
			});
		},
		leftAdd: function() {
			var _this = this;
			this.toolbarLeft = $(this.toolbarEl).find('.ui-toolbar-left-row');
			$(arguments).each(function(){
				var tmpLeftItem=$('<td class="ui-toolbar-cell"></td>');
				this.render(tmpLeftItem);
				$(_this.toolbarLeft).append(tmpLeftItem);
			});
		},
		rightAdd: function() {
			var _this = this;
			this.toolbarRight = $(this.toolbarEl).find('.ui-toolbar-right-row');
			$(arguments).each(function(){
				var tmpRightItem=$('<td class="ui-toolbar-cell"></td>');
				this.render(tmpRightItem);
				$(_this.toolbarRight).append(tmpRightItem);
			});
		},
		render: function() {
			var _this = this;
			this.parent = arguments[0] || 'body';
			$(this).trigger('BEFORE_RENDER');
			if (this.cloneEl != null) {
				this.toolbarEl = $(this.cloneEl).clone(true, true);
			}
			$(this.parent).append(this.toolbarEl);
			$(this).trigger('AFTER_RENDER');
		}
	}
});
