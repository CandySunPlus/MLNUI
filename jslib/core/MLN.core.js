(function() {
	/**
	 * Selector
	 */
	var _sele = (function() {
		var exprClassName = /^(?:[\w\-]+)?\.([\w\-]+)/,
		exprId = /^(?:[\w\-]+)?#([\w\-]+)/,
		exprNodeName = /^([\w\*\-]+)/,
		exprNodeAttr = /^(?:[\w\-]+)?\[([\w]+)(=(\w+))?\]/,
		na = [null, null, null, null];
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
			//Como.Object.extend(result, _como_prototype);
			return result;
		}
		return null;
	}
	MLN.version = "1.0.0";
})();