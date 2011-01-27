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
			}
		}
	}

	/**
	 * MLN Extend
	 */
	MLN.extend = function(options) {
		MLN.Object.extend(MLN, options);
	};

	MLN.extend({
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
		}
	});

})();

//
