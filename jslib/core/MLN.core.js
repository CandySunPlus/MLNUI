/**
 * MLN Mini Javascript frameworks
 * 
 * Copyright 2010 MLN Studio.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function() {
	/**
	 * MLN Variable
	 */
	var exprClassName = /^(?:[\w\-]+)?\.([\w\-]+)/,
	exprId = /^(?:[\w\-]+)?#([\w\-]+)/,
	exprNodeName = /^([\w\*\-]+)/,
	exprNodeAttr = /^(?:[\w\-]+)?\[([\w]+)(=(\w+))?\]/,
	// Save a reference to some core methods
	toString = Object.prototype.toString,
	hasOwn = Object.prototype.hasOwnProperty,
	push = Array.prototype.push,
	slice = Array.prototype.slice,
	trim = String.prototype.trim,
	indexOf = Array.prototype.indexOf,
	// A simple way to check for HTML strings or ID strings
	quickExpr = /^(?:[^<]*(<[\w\W]+>)[^>]*$|#([\w\-]+)$)/,
	// Is it a simple selector
	isSimple = /^.[^:#\[\.,]*$/,
	// A template match
	rtemplate = /(?:^|.|\r|\n)(\{(.*?)\})/g;
	// Check if a string has a non-whitespace character in it
	rnotwhite = /\S/,
	rwhite = /\s/,
	// Used for trimming whitespace
	trimLeft = /^\s+/,
	trimRight = /\s+$/,
	// Check for non-word characters
	rnonword = /\W/,
	// Check for digits
	rdigit = /\d/,
	// Match a standalone tag
	rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,
	// JSON RegExp
	rvalidchars = /^[\],:{}\s]*$/,
	rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
	rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
	rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
	// Useragent RegExp
	rwebkit = /(webkit)[ \/]([\w.]+)/,
	ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
	rmsie = /(msie) ([\w.]+)/,
	rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,
	class2type = {};
	/**
	 * MLN Selector
	 */
	var _sele = (function() {
		var na = [null, null, null, null];
		function _find(selector, context) {
			context = context || document;
			var simple = /^[\w\-#]+$/.test(selector);
			if (!simple && context.querySelectorAll) {
				if (context.nodeType == 1) {
					var old = context.id,
					id = context.id = "__MLN__";
					try {
						return realArray(context.querySelectorAll("#" + id + " " + selector));
					} catch(e) {} finally {
						if (old) {
							context.id = old;
						} else {
							context.removeAttribute("id");
						}
					}
				}
				return realArray(context.querySelectorAll(selector));
			}
			if (selector.indexOf(',') > -1) {
				var split = selector.split(/,/g),
				ret = [],
				sIndex = 0,
				len = split.length;
				for (; sIndex < len; ++sIndex) {
					ret = ret.concat(_find(split[sIndex], context));
				}
				return unique(ret);
			}
			selector = selector.replace(' > ', '>').replace('>', ' > ');
			var parts = selector.split(/ /g),
			part = parts.pop(),
			id = (part.match(exprId) || na)[1],
			className = !id && (part.match(exprClassName) || na)[1],
			nodeName = !id && (part.match(exprNodeName) || na)[1],
			_attr = part.match(exprNodeAttr) || na,
			attrName = _attr[1] || null,
			attrValue = _attr[3] || null,
			collection = !id && realArray(context.getElementsByTagName(nodeName || '*'));
			if (className) {
				collection = filterByAttr(collection, 'className', className);
			}
			if (attrName) {
				collection = filterByAttr(collection, attrName, attrValue);
			}
			if (id) {
				var byId = context.getElementById(id);
				return byId ? [byId] : [];
			}
			return parts[0] && collection[0] ? filterParents(parts, collection) : collection;
		}

		function realArray(c) {
			try {
				return Array.prototype.slice.call(c);
			} catch(e) {
				var ret = [],
				i = 0,
				len = c.length;
				for (; i < len; ++i) {
					ret[i] = c[i];
				}
				return ret;
			}
		}

		function filterParents(selectorParts, collection, direct) {
			var parentSelector = selectorParts.pop();
			if (parentSelector === '>') {
				return filterParents(selectorParts, collection, true);
			}
			var ret = [],
			r = -1,
			id = (parentSelector.match(exprId) || na)[1],
			className = !id && (parentSelector.match(exprClassName) || na)[1],
			nodeName = !id && (parentSelector.match(exprNodeName) || na)[1],
			cIndex = -1,
			node,
			parent,
			matches;
			nodeName = nodeName && nodeName.toLowerCase();
			while ((node = collection[++cIndex])) {
				parent = node.parentNode;
				do {
					matches = !nodeName || nodeName === '*' || nodeName === parent.nodeName.toLowerCase();
					matches = matches && (!id || parent.id === id);
					matches = matches && (!className || RegExp('(^|\\s)' + className + '(\\s|$)').test(parent.className));
					if (direct || matches) {
						break;
					}
				} while (( parent = parent . parentNode ));
				if (matches) {
					ret[++r] = node;
				}
			}
			return selectorParts[0] && ret[0] ? filterParents(selectorParts, ret) : ret;
		}

		var unique = function() {
			var uid = +new Date();
			var data = function() {
				var n = 1;
				return function(elem) {
					var cacheIndex = elem[uid],
					nextCacheIndex = n++;
					if (!cacheIndex) {
						elem[uid] = nextCacheIndex;
						return true;
					}
					return false;
				};
			} ();
			return function(arr) {
				var length = arr.length,
				ret = [],
				r = -1,
				i = 0,
				item;
				for (; i < length; ++i) {
					item = arr[i];
					if (data(item)) {
						ret[++r] = item;
					}
				}
				uid += 1;
				return ret;
			};
		} ();

		function filterByAttr(collection, attr, value) {
			var reg = RegExp('(^|\\s)' + value + '(\\s|$)');
			var test = function(node) {
				var v = attr == 'className' ? node.className: node.getAttribute(attr);
				if (v) {
					if (value) {
						if (reg.test(v)) return true;
					} else {
						return true;
					}
				}
				return false;
			};
			var i = -1,
			node, r = -1,
			ret = [];
			while ((node = collection[++i])) {
				if (test(node)) {
					ret[++r] = node;
				}
			}
			return ret;
		}
		return _find;
	})();

	var __mln_prototype__ = {
		mln: true,
		size: function() {
			return this.length;
		},
		get: function(num) {
			return num == undefined ? this: MLN(this[num]);
		},
		each: function(callback, args) {
			return MLN.each(this, callback, args);
		}
	}

	/**
	 * MLN Lib
	 */
	var _find = function(selector, context) {
		if (selector == null) return [];
		if (selector instanceof Array) {
			return selector;
		} else {
			if (typeof selector == 'object') {
				if (selector.nodeType) {
					return [selector];
				} else if (selector.size) {
					return selector;
				} else {
					return [selector];
				}
			} else {
				if (typeof selector != 'string') {
					return [];
				} else {
					if (context && context.size && context.length) context = context[0];
					return _sele(selector, context);
				}
			}
		}
	}

	var MLN = window.MLN = function(selector, context) {
		var result = _find(selector, context);
		if (result.length) {
			MLN.Object.extend(result, __mln_prototype__);
			return result;
		}
		return null;
	}

	MLN.version = "1.0.0";

	/**
	 * MLN Object
	 */
	MLN.Object = {
		extend: function(target, src) {
			for (var it in src) {
				target[it] = src[it];
			}
			return target;
		},
		each: function(obj, callback) {
			var i = 0;
			for (var it in obj) {
				if (callback(obj[it], it, i++) == 'break') break;
			}
			return obj;
		},
		clone: function(obj) {
			var con = obj.constructor,
			cloneObj = null;
			if (con == Object) {
				cloneObj = new con();
			} else if (con == Function) {
				//TODO: MLN Function Clone 
			} else cloneObj = new con(obj.valueOf());
			for (var it in obj) {
				if (cloneObj[it] != obj[it]) {
					if (typeof(obj[it]) != 'object') {
						cloneObj[it] = obj[it];
					} else {
						cloneObj[it] = arguments.callee(obj[it]);
					}
				}
			}
			cloneObj.toString = obj.toString;
			cloneObj.valueOf = obj.valueOf;
			return cloneObj;
		},
		toStr: function(obj) {
			try {
				if (obj instanceof Array) {
					var r = [];
					for (var i = 0; i < obj.length; i++) r.push(arguments.callee(obj[i]));
					return "[" + r.join() + "]";
				} else if (typeof obj == 'string') {
					return "\"" + obj.replace("\"", "'").replace(/([\'\"\\])/g, "\\$1").replace(/(\n)/g, "\\n").replace(/(\r)/g, "\\r").replace(/(\t)/g, "\\t") + "\"";
				} else if (typeof obj == 'number') {
					return obj.toString();
				} else if (typeof obj == 'object') {
					if (obj == null) {
						return '';
					} else {
						var r = [];
						for (var i in obj) r.push("\"" + i + "\":" + arguments.callee(obj[i]));
						return "{" + r.join() + "}";
					}
				} else if (typeof obj == 'boolean') {
					return obj + '';
				} else if (typeof obj == 'function') {
					return obj.toString();
				} else {
					return '';
				}
			} catch(e) {
				return '';
			}
		}
	};
	MLN.Object.each("Boolean Number String Function Array Date RegExp Object".split(" "),
	function(obj, name, i) {
		class2type["[object " + obj + "]"] = obj.toLowerCase();
	});

	/**
	 * MLN Class
	 */
	MLN.Class = {
		create: function() {
			var f = function() {
				this.initialize.apply(this, arguments);
			};
			for (var i = 0,
			il = arguments.length,
			it; i < il; i++) {
				it = arguments[i];
				if (it == null) continue;
				MLN.Object.extend(f.prototype, it);
			}
			return f;
		},
		inherit: function(superC, opt) {
			function temp() {};
			temp.prototype = superC.prototype;
			var f = function() {
				this.initialize.apply(this, arguments);
			}
			f.prototype = new temp();
			MLN.Object.extend(f.prototype, opt);
			f.prototype.superClass_ = superC.prototype;
			f.prototype.super_ = function() {
				this.superClass_.initialize.apply(this, arguments);
			};
			return f;
		}
	}

	/**
	 * MLN Template
	 */
	var Template = MLN.Class.create({
		initialize: function(s) {
			this.template = s.toString();
			this.reg = rtemplate;
			this.data = {};
			return this;
		},
		set: function(name, value) {
			if (typeof name == 'string') {
				this.data[name] = value;
			} else {
				if (typeof name == 'object') {
					for (var it in name) {
						this.data[it] = name[it];
					}
				}
			}
			return this;
		},
		run: function() {
			return this.template.replace(this.reg, MLN.Function.bind(function(r, v1, v2) {
				if (r.indexOf('\\') == 0) {
					return r.replace('\\{', '{').replace('\\}', '}');
				} else {
					var f = r.substring(0, 1).replace('{', '');
					var n = this.data[v2];
					if (n) if (typeof n == 'string') return f + n;
					else return f + MLN.Object.toStr(n);
					return f;
				}
			},
			this));
		}
	});

	/**
	 * MLN Function
	 */
	MLN.Function = {
		timeout: function(fun, time) {
			return setTimeout(fun, time);
		},
		interval: function(fun, time) {
			return setInterval(fun, time);
		},
		bind: function(fun) {
			var _this = arguments[1],
			args = [];
			for (var i = 2,
			il = arguments.length; i < il; i++) {
				args.push(arguments[i]);
			}
			return function() {
				var thisArgs = args.concat();
				for (var i = 0,
				il = arguments.length; i < il; i++) {
					thisArgs.push(arguments[i]);
				}
				return fun.apply(_this || this, thisArgs);
			}
		},
		bindEvent: function(fun) {
			var _this = arguments[1],
			args = [];
			for (var i = 2,
			il = arguments.length; i < il; i++) {
				args.push(arguments[i]);
			}
			return function(e) {
				var thisArgs = args.concat();
				thisArgs.unshift(e || window.event);
				return fun.apply(_this || this, thisArgs);
			}
		},
		clone: function(fun) {
			var clone = function() {
				return fun.apply(this, arguments);
			};
			clone.prototype = fun.prototype;
			for (prototype in fun) {
				if (fun.hasOwnProperty(prototype) && prototype != 'prototype') {
					clone[prototype] = fun[prototype];
				}
			}
			return clone;
		}
	}

	/**
	 * MLN String
	 */
	MLN.String = {
		trim: function(str) {
			return MLN.trim(str);
		},
		escapeHTML: function(str) {
			return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		},
		unescapeHTML: function(str) {
			return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
		},
		byteLength: function(str) {
			return str.replace(/[^\x00-\xff]/g, "**").length;
		},
		delLast: function(str) {
			return str.substring(0, str.length - 1);
		},
		toInt: function(str) {
			return Math.floor(str);
		},
		toArray: function(str, o) {
			return str.split(o || '');
		},
		left: function(str, n) {
			var s = str.replace(/\*/g, " ").replace(/[^\x00-\xff]/g, "**");
			s = s.slice(0, n).replace(/\*\*/g, " ").replace(/\*/g, "").length;
			return str.slice(0, s);
		},
		right: function(str, n) {
			var len = str.length;
			var s = str.replace(/\*/g, " ").replace(/[^\x00-\xff]/g, "**");
			s = s.slice(s.length - n, s.length).replace(/\*\*/g, " ").replace(/\*/g, "").length;
			return str.slice(len - s, len);
		},
		removeHTML: function(str) {
			return str.replace(/<\/?[^>]+>/gi, '');
		},
		format: function() {
			var str = arguments[0],
			args = [];
			for (var i = 1,
			il = arguments.length; i < il; i++) {
				args.push(arguments[i]);
			}
			return str.replace(/\{(\d+)\}/g,
			function(m, i) {
				return args[i];
			});
		},
		toLower: function(str) {
			return str.toLowerCase();
		},
		toUpper: function(str) {
			return str.toUpperCase();
		},
		on16: function(str) {
			var a = [],
			i = 0;
			for (; i < str.length;) a[i] = ("00" + str.charCodeAt(i++).toString(16)).slice( - 4);
			return "\\u" + a.join("\\u");
		},
		un16: function(str) {
			return unescape(str.replace(/\\/g, "%"));
		}
	}

	/**
	 * MLN Array
	 */
	MLN.Array = {
		unique: function(arr) {
			if (arr.length && typeof(arr[0]) == 'object') {
				var len = arr.length;
				for (var i = 0,
				il = len; i < il; i++) {
					var it = arr[i];
					for (var j = len - 1; j > i; j--) {
						if (arr[j] == it) arr.splice(j, 1);
					}
				}
				return arr;
			} else {
				var result = [],
				hash = {};
				for (var i = 0,
				key; (key = arr[i]) != null; i++) {
					if (!hash[key]) {
						result.push(key);
						hash[key] = true;
					}
				}
				return result;
			}
		},
		_onlyPush: function(arr, it) {
			if (it.constructor != Array) it = [it];
			return MLN.Array.unique(arr.concat(it));
		},
		_each: function(arr, callback, collect, only) {
			var r = [];
			for (var i = 0,
			il = arr.length; i < il; i++) {
				var v = callback(arr[i], i);
				if (collect && typeof(v) != 'undefined') {
					if (only) {
						r = this._onlyPush(r, v);
					} else {
						r.push(v);
					}
				} else {
					if (!collect && v == 'break') break;
				}
			}
			return r;
		},
		each: function(arr, callback, args) {
			return MLN.each(arr, callback, args);
		},
		collect: function(arr, ca, only) {
			return this._each(arr, ca, true, only);
		},
		include: function(arr, value) {
			return this.index(arr, value) != -1;
		},
		index: function(arr, value) {
			for (var i = 0,
			il = arr.length; i < il; i++) {
				if (arr[i] == value) return i;
			}
			return - 1;
		},
		remove: function(arr, o) {
			if (typeof o == 'number' && !MLN.Array.include(arr, o)) {
				arr.splice(o, 1);
			} else {
				var i = MLN.Array.index(arr, o);
				arr.splice(i, 1);
			}
			return arr;
		},
		random: function(arr) {
			var i = Math.round(Math.random() * (arr.length - 1));
			return arr[i];
		}
	}

	/**
	 * MLN Date
	 */
	MLN.Date = {
		format: function(date, f) {
			var o = {
				"M+": date.getMonth() + 1,
				"d+": date.getDate(),
				"h+": date.getHours(),
				"m+": date.getMinutes(),
				"s+": date.getSeconds(),
				"q+": Math.floor((date.getMonth() + 3) / 3),
				"S": date.getMilliseconds()
			};
			if (/(y+)/.test(f)) f = f.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
			for (var k in o) if (new RegExp("(" + k + ")").test(f)) f = f.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
			return f;
		}
	}

	/**
	 * MLN Event
	 */
	MLN.Event = {
		custom: function(obj, names, options) {
			var ce = obj._customEvents = {};
			for (var i = 0,
			il = names.length; i < il; i++) {
				ce[names[i]] = [];
			}
			if (options) {
				if (options.onListener) {
					ce._onListener = options.onListener;
				}
			}
			var bind = MLN.Function.bind;
			obj.on = bind(this._customOn, this, obj);
			obj.un = bind(this._customUn, this, obj);
			obj.fire = bind(this._customFire, this, obj);
			return obj;
		},
		_customOn: function(obj, name, listener) {
			var ce = obj._customEvents;
			if (!ce || !ce[name]) return;

			ce[name].push(listener);
			if (ce._onListener && ce._onListener[name]) {
				var f = ce._onListener[name];
				if (MLN.isFunction(f)) f(obj, name, listener);
			}
			return this;
		},
		_customUn: function(obj, name, listener) {
			var ce = obj._customEvents;
			if (!ce || !ce[name]) return;
			MLN.Array.remove(ce[name], listener);
			return this;
		},
		//fire event
		_customFire: function(obj, name, data) {
			var ce = obj._customEvents;
			if (!ce || !ce[name]) return;

			var ces = ce[name],
			e = {
				type: name,
				//事件名
				srcElement: obj,
				//事件源
				data: data,
				//传递值
				isStop: false,
				//当前事件是否停止传递
				stop: function() {
					this.isStop = true;
				} //停止事件传递给下一个Listener
			};
			for (var i = 0,
			il = ces.length; i < il; i++) {
				if (!e.isStop) ces[i](e);
			}
			return this;
		},
		//simulate user to fire event
		simulate: function(el, ename) {
			if (!el) return;
			if (el.mln) el = el[0];
			if (MLN.Browser.ie) {
				el[ename]();
			} else if (document.createEvent) {
				var ev = document.createEvent('HTMLEvents');
				ev.initEvent(ename, false, true);
				el.dispatchEvent(ev);
			}
			return el;
		},
		__e_handlers: {},
		on: document.addEventListener ?
		function(el, name, fun) {
			if (!el) return;
			if (el.mln) el = el[0];
			el.addEventListener(name, fun, false);
		}: function(el, name, fun) {
			if (!el) return;
			if (el.mln) el = el[0];
			var ns = new Date().getTime();
			if (!el.__e_ns) el.__e_ns = ns;
			if (!fun.__e_ns) fun.__e_ns = ns;
			this.__e_handlers[el.__e_ns + '_' + fun.__e_ns] = function(e) {
				e.currentTarget = el;
				fun(e);
			};
			el.attachEvent('on' + name, this.__e_handlers[el.__e_ns + '_' + fun.__e_ns]);
		},
		un: document.removeEventListener ?
		function(el, name, fun) {
			if (!el) return;
			if (el.mln) el = el[0];
			el.removeEventListener(name, fun, false);
		}: function(el, name, fun) {
			if (!el) return;
			if (el.mln) el = el[0];
			if (el.__e_ns && fun.__e_ns) el.detachEvent('on' + name, this.__e_handlers[el.__e_ns + '_' + fun.__e_ns]);
		},
		out: function(el, name, fun, one) {
			one = one || false;
			if (!el._Event) {
				el._Event = {
					out: []
				};
			}
			var callback = function(e) {
				var ele = MLN.Event.element(e);
				if (!ele) return;
				var tag = ele[0];
				var temp = false;
				while (tag) {
					if (tag == el) {
						temp = true;
						break;
					}
					tag = tag.parentNode;
				}
				if (!temp) {
					fun(e);
					if (one) {
						MLN.Event.unout(el, name, fun);
					}
				};
			};
			var c = MLN.Function.bindEvent(callback, window);
			el._Event.out.push({
				name: name,
				fun: fun,
				efun: c
			});
			MLN.Event.on(document, name, c);
		},
		unout: function(el, name, fun) {
			if (el._Event && el._Event.out && el._Event.out.length) {
				var arr = el._Event.out;
				for (var i = 0; i < arr.length; i++) {
					if (name == arr[i].name && fun == arr[i].fun) {
						MLN.Event.un(document, name, arr[i].efun);
						arr.splice(i, 1);
						return;
					}
				}
			}
		},
		stop: function(e) {
			e.returnValue = false;
			if (e.preventDefault) {
				e.preventDefault();
			}
			MLN.Event.stopPropagation(e);
		},
		//stopPropagation
		stopPropagation: function(e) {
			e.cancelBubble = true;
			if (e.stopPropagation) {
				e.stopPropagation();
			}
		},
		//take the event target who listened event
		target: function(e) {
			return MLN(e.currentTarget);
		},
		//take the event target who fired event
		element: function(e) {
			return MLN(e.target || e.srcElement);
		},
		//take the position of the event
		pos: function(e) {
			if (e.pageX || e.pageY) {
				return {
					x: e.pageX,
					y: e.pageY
				};
			}
			return {
				x: e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft),
				y: e.clientY + (document.documentElement.scrollTop || document.body.scrollTop)
			};
		}
	};

	/**
	 * MLN Browser
	 */
	(function() {
		var agent = navigator.userAgent.toLowerCase();
		MLN.Browser = {
			version: (agent.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [0, '0'])[1],
			safari: /webkit/i.test(agent) && !this.chrome,
			opera: /opera/i.test(agent),
			firefox: /firefox/i.test(agent),
			ie: /msie/i.test(agent) && !/opera/.test(agent),
			chrome: /chrome/i.test(agent) && /webkit/i.test(agent) && /mozilla/i.test(agent)
		};
	})();

	/**
	 * MLN Cookie
	 */
	MLN.Cookie = {
		get: function(name) {
			var v = document.cookie.match('(?:^|;)\\s*' + name + '=([^;]*)');
			return v ? decodeURIComponent(v[1]) : null;
		},
		set: function(name, value, expires, path, domain) {
			var str = name + "=" + encodeURIComponent(value);
			if (expires != null || expires != '') {
				if (expires == 0) {
					expires = 100 * 365 * 24 * 60;
				}
				var exp = new Date();
				exp.setTime(exp.getTime() + expires * 60 * 1000);
				str += "; expires=" + exp.toGMTString();
			}
			if (path) {
				str += "; path=" + path;
			}
			if (domain) {
				str += "; domain=" + domain;
			}
			document.cookie = str;
		},
		del: function(name, path, domain) {
			document.cookie = name + "=" + ((path) ? "; path=" + path: "") + ((domain) ? "; domain=" + domain: "") + "; expires=Thu, 01-Jan-70 00:00:01 GMT";
		}
	};

	/**
	 * MLN Ajax
	 */
	MLN.Ajax = {
		ajax: function(url, options) {
			var http = this._XMLHttpRequest();
			var op = MLN.Object.extend({
				method: 'get',
				async: true,
				data: null,
				format: 'json',
				encode: 'UTF-8',
				success: function() {},
				failure: function() {},
				whatever: function() {},
				hearders: null //set header (object)
			},
			options || {});

			if (op.method == 'get' && typeof(op.data) == 'string') {
				url += (url.indexOf('?') == -1 ? '?': '&') + op.data;
				op.data = null;
			}

			http.open(op.method, url, op.async);
			if (op.method == 'post') {
				http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=' + op.encode);
			}
			if (op.headers) {
				for (var it in op.headers) http.setRequestHeader(it, op.headers[it]);
			}
			http.onreadystatechange = MLN.Function.bind(this._onStateChange, this, http, op);
			http.send(op.data || null);
			return http;
		},
		text: function(url, op) {
			op.format = 'text';
			return this.ajax(url, op);
		},
		xml: function(url, op) {
			op.format = 'xml';
			return this.ajax(url, op);
		},
		json: function(url, op) {
			op.format = 'json';
			return this.ajax(url, op);
		},
		_XMLHttpRequest: function() {
			switch (this._XMLHttpType) {
			case 0:
				return new XMLHttpRequest();
			case 1:
				return new ActiveXObject('MSXML2.XMLHTTP');
			case 2:
				return new ActiveXObject('Microsoft.XMLHTTP');
			case 3:
				return null;
			default:
				var t = [function() {
					return new XMLHttpRequest();
				},
				function() {
					return new ActiveXObject('MSXML2.XMLHTTP');
				},
				function() {
					return new ActiveXObject('Microsoft.XMLHTTP');
				}];
				for (var i = 0,
				l = t.length; i < l; i++) {
					try {
						this._XMLHttpType = i;
						return t[i]();
					} catch(e) {}
				}
				this._XMLHttpType = 3;
				return null;
			}
		},
		_onStateChange: function(http, op) {
			if (http.readyState == 4) {
				http.onreadystatechange = function() {};
				var s = http.status,
				tmp = http;
				if (op.whatever) op.whatever(http);
				if ( !! s && s >= 200 && s < 300) {
					if (!MLN.isFunction(op.success)) return;
					if (typeof(op.format) == 'string') {
						switch (op.format) {
						case 'text':
							tmp = http.responseText;
							break;
						case 'json':
							tmp = eval('(' + http.responseText + ')');
							break;
						case 'xml':
							tmp = http.responseXML;
							break;
						}
					}
					op.success(tmp);
				} else {
					if (MLN.isFunction(op.failure)) op.failure(http);
				}
			}
		}
	};
	
	MLN.Ajax.Model = MLN.Class.create({
		/**
		 * options demo
		 * {
		 *     add: {
		 *         url:        '',
		 *         params:     ['param1', 'param2'],
		 *         method:     'get/post',
		 *         format:     'json',
		 *         cache:       false
		 *     },
		 *     del ...
		 *  }	
		 */
		initialize: function(options) {
			var _this = this,
			bind = MLN.Function.bind;
			for (var it in options) {
				_this[it] = bind(this._bindMethod, _this, options[it]);
			}
		},

		_bindMethod: function(action, param, callback) {
			var arr = [];
			var encode = function(v) {
				return encodeURIComponent(v);
			};
			if (param) {
				if (action.params) {
					MLN.Array.each(action.params,
					function(i) {
						var v = param[this];
						if (typeof(v) == 'string' || typeof(v) == 'number' || typeof(v) == 'boolean') {
							arr.push(this + '=' + encode(v));
						}
					});
				} else {
					for (var it in param) {
						var iv = param[it],
						ivt = typeof(iv);
						if (ivt == 'string' || ivt == 'number') {
							arr.push(it + '=' + encode(iv));
						}
					}
				}
			}

			if (!action.cache) arr.push('ts=' + (new Date()).getTime());

			var data = arr.join('&');
			MLN.Ajax.ajax(action.url, {
				data: data,
				method: action.method,
				format: action.format,
				success: callback.success,
				failure: callback.failure,
				whatever: callback.whatever
			});
		}
	});

	/**
	 * MLN Extend
	 */
	MLN.extend = function(options) {
		MLN.Object.extend(MLN, options);
	};

	MLN.extend({
		template: function(s) {
			return new Template(s);
		},
		isFunction: function(obj) {
			return MLN.type(obj) === "function";
		},
		isNaN: function(obj) {
			return obj == null || !rdigit.test(obj) || isNaN(obj);
		},
		isArray: function(obj) {
			return MLN.type(obj) === "array";
		},
		isEmptyObject: function(obj) {
			for (var name in obj) {
				return false;
			}
			return true;
		},
		type: function(obj) {
			return obj == null ? String(obj) : class2type[toString.call(obj)] || "object";
		},
		each: function(object, callback, args) {
			var name, i = 0,
			length = object.length,
			isObj = length === undefined || MLN.isFunction(object);
			if (args) {
				if (isObj) {
					for (name in object) {
						if (callback.apply(object[name], args) == 'break') break;
					}
				} else {
					for (; i < length;) {
						if (callback.apply(object[i++], args) == 'break') break;
					}
				}
			} else {
				if (isObj) {
					for (name in object) {
						if (callback.call(object[name], name, object[name]) == 'break') break;
					}
				} else {
					for (var value = object[0]; i < length && callback.call(value, i, value) != 'break'; value = object[++i]) {}
				}
			}
			return object;
		},
		trim: trim ?
		function(text) {
			return text == null ? "": trim.call(text)
		}: function(text) {
			return text == null ? "": text.toString().replace(trimLeft, "").replace(trimRight, "");
		},
		inArray: function(elem, array) {
			if (array.indexOf) {
				return array.indexOf(elem);
			}
			for (var i = 0,
			length = array.length; i < length; i++) {
				if (array[i] === elem) {
					return i;
				}
			}
			return - 1;
		},
		merge: function(first, second) {
			var i = first.length,
			j = 0;
			if (typeof second.length === "number") {
				for (var l = second.length; j < l; j++) {
					first[i++] = second[j];
				}
			} else {
				while (second[j] !== undefined) {
					first[i++] = second[j++];
				}
			}
			first.length = i;
			return first;
		},
		grep: function(elems, callback, inv) {
			var ret = [],
			retVal;
			inv = !!inv;
			for (var i = 0,
			length = elems.length; i < length; i++) {
				retVal = !!callback(elems[i], i);
				if (ret !== retVal) {
					ret.push(elems[i]);
				}
			}
			return ret;
		},
		map: function(elems, callback, arg) {
			var ret = [],
			value;
			for (var i = 0,
			length = elems.length; i < length; i++) {
				value = callback(elems[i], i, arg);
				if (value != null) {
					ret[ret.length] = value;
				}
			}
			return ret.concat.apply([], ret);
		}
	});

	if (!MLN._version || MLN._version != 'only') {
		var ext = function(target, src, is) {
			if (!target) target = {};
			for (var it in src) {
				if (is) {
					target[it] = MLN.Function.bind(function() {
						var c = arguments[0],
						f = arguments[1];
						var args = [this];
						for (var i = 2,
						il = arguments.length; i < il; i++) {
							args.push(arguments[i]);
						}
						return c[f].apply(c, args);
					},
					null, src, it);
				} else {
					target[it] = src[it];
				}
			}
		};
		ext(Object, MLN.Object, false);
		ext(window.Class = {},
		MLN.Class, false);
		ext(Function.prototype, MLN.Function, true);
		ext(String.prototype, MLN.String, true);
		ext(Array.prototype, MLN.Array, true);
		ext(Date.prototype, MLN.Date, true);
		window.M = MLN;
	}
})();

//
