(function(m){function n(a,b,c,g){c=c!=null?c:b;for(var e in a)if(a.hasOwnProperty(e))c[e]=d.rewrite(e,a,b,g);return b}function j(a){return y.call(a)==="[object Function]"}var p=false,d,q="_Class"+(new Date).getTime()+"_",r="_"+q+"_",u="_"+r+"_",v=/\b_parent\b/.test(function(){this._parent()}),w=v?/\b_parent\b/:/.*/,o=v?/\b_parent\b\./:/.*/,z=RegExp.prototype.test,y=Object.prototype.toString,s=function(){function a(b){if(this instanceof a){if(p===false&&j(this.init))this.init.apply(this,typeof b===
"object"&&b!==null&&b.callee?b:arguments)}else return new a(arguments)}a[r]=true;return a},k=s();k.extend=function(a,b){var c=s(),g,e=this,f,l=e.prototype;if(typeof a!=="boolean")b=a;b=typeof b==="object"&&b!==null?b:{};f=b.prototype;for(g in e)if(e.hasOwnProperty(g))c[g]=e[g];if(a===true||typeof f==="object"&&f!=null){n(b,e,c,d.initPopulator(e));b=f}c.constructor=c;p=true;f=new e;p=false;b=b||{};n(b,l,f,d.initPopulator(l));c.prototype=f;c.prototype.constructor=c;c.inherits=function(h){return h===
e||e.inherits(h)};return c};k.addMethods=function(a){return n(a,this.prototype)};k.inherits=function(){return false};k.prototype={addMethods:function(a){return n(a,this)}};o.test=function(a){return z.call(o,a)||a[u]===true};d=function(a,b){return k.extend(a,b)};d.fnSearch=w;d.parentFnSearch=o;d.log_prefix="_Class";d.errors={logic_parent_call:"Logic error, unable to call the parent function since it isn't defined..",invalid_$:"Invalid data-type of the global '$' property"};d.makeClass=s;d.rewrite=
function(a,b,c,g){return j(b[a])&&(j(c[a])||!(a in c))&&!d.is(b[a])&&w.test(b[a])?function(e,f,l){f||(f=function(){throw d.log_prefix+d.errors.logic_parent_call;});var h=!!(j(l)&&o.test(e)),x=function(){var A="_parent"in this,B=this._parent,i;if(h===true){h=false;i=l();for(var t in i)if(i.hasOwnProperty(t))f[t]=i[t]}this._parent=f;this._parent[q]=this;i=e.apply(this,arguments);if(A)this._parent=B;else try{delete this._parent}catch(C){}return i};x[u]=h;return x}(b[a],c[a],g):b[a]};d.is=function(a){return!!(a&&
a[r]===true)};d.initPopulator=function(a){var b;return function(){if(b==null){b={};for(var c in a)if(j(a[c]))b[c]=function(g){return function(){return g.apply(this[q],arguments)}}(a[c])}return b}};if(!m.$){if("$"in m)throw d.log_prefix+d.errors.invalid_$;m.$={}}m.$.Class=d})(this);
/**
 * MLNUI Core lib
 * MLN Studio (c) 2011
 * site:www.sfmblog.cn
 */
(function($) {
	$.extend({
		MLNUI: {
			Version: '1.00',
			Author: 'CandySunPlus',
			Files:[],
			Mouse:{},
			MouseFix:(function(){
				return function(){
					if($.browser.msie && parseInt(jQuery.browser.version)<9){
						$.MLNUI.Mouse.LB=1;
						$.MLNUI.Mouse.RB=2;
						$.MLNUI.Mouse.MB=4;
					}else{
						$.MLNUI.Mouse.LB=0;
						$.MLNUI.Mouse.RB=2;
						$.MLNUI.Mouse.MB=1;
					}
				}
			})(),
			compareInt: function(int1, int2) {
				var iNum1 = parseInt(int1);
				var iNum2 = parseInt(int2);
				if (iNum1 < iNum2) {
					return -1;
				} else if (iNum1 > iNum2) {
					return 1;
				} else {
					return 0;
				}
			}
		},
		emptyFn: function() {}
	});
	$.MLNUI.MouseFix();
	Array.prototype.clone=function(){ return this.slice(0); }
})(jQuery);
