/* jshint strict:false */
module.exports = (function () {

  // shorthand reference to native types prototype methods:
  var slice = [].slice;
  var toString = {}.toString;

  /*
   * isObject, extend, isFunction, throttle, debounce and each are taken from undescore/lodash in
   * order to remove the dependency
   */
  var _ = {

    isArray: function(arr) {
      return Object.prototype.toString.call(arr) === '[object Array]';
    },

    isObject: function(obj) {
      var type = typeof obj;
      return type === 'function' || type === 'object' && !!obj;
    },

    isFunction: function(obj) {
      if (typeof /./ !== 'function' && typeof Int8Array !== 'object') {
        return typeof obj === 'function' || false;
      } else {
        return toString.call(obj) === '[object Function]';
      }
    },

    isString: function(obj) {
      return toString.call(obj) === '[object String]';
    },

    isOwn: function(obj, prop) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    },

    bind: function(fn, context) {
      // Quick check to determine if target is callable, in the spec
      // this throws a TypeError, but we will just return undefined.
      if (!this.isFunction(fn)) {
        return undefined;
      }

      var args = slice.call( arguments, 2 );

      return function() {
        return fn.apply(context || this, args.concat(slice.call(arguments)));
      };
    },

    each: function(obj, iteratee) {
      var i, length;
      if (_.isArray(obj)) {
        for (i = 0, length = obj.length; i < length; i++) {
          iteratee(obj[i], i, obj);
        }
      } else {
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            iteratee(obj[key], key, obj);
          }
        }
      }
    },

    extend: function(obj) {
      if (!this.isObject(obj)) {
        return obj;
      }
      var source, prop;
      for (var i = 1, length = arguments.length; i < length; i++) {
        source = arguments[i];
        for (prop in source) {
          if (Object.getOwnPropertyDescriptor && Object.defineProperty) {
            var propertyDescriptor = Object.getOwnPropertyDescriptor(source, prop);
            Object.defineProperty(obj, prop, propertyDescriptor);
          } else {
            obj[prop] = source[prop];
          }
        }
      }
      return obj;
    },

    throttle: function(func, wait, options) {
      var context, args, result;
      var timeout = null;
      var previous = 0;
      if (!options) options = {};
      var later = function() {
        previous = options.leading === false ? 0 : _.now();
        timeout = null;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      };
      return function() {
        var now = _.now();
        if (!previous && options.leading === false) previous = now;
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0 || remaining > wait) {
          if (timeout) {
            clearTimeout(timeout);
            timeout = null;
          }
          previous = now;
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        } else if (!timeout && options.trailing !== false) {
          timeout = setTimeout(later, remaining);
        }
        return result;
      };
    },

    debounce: function(func, wait, immediate) {
      var timeout, args, context, timestamp, result;

      var later = function() {
        var last = _.now() - timestamp;

        if (last < wait && last >= 0) {
          timeout = setTimeout(later, wait - last);
        } else {
          timeout = null;
          if (!immediate) {
            result = func.apply(context, args);
            if (!timeout) context = args = null;
          }
        }
      };

      return function() {
        context = this;
        args = arguments;
        timestamp = _.now();
        var callNow = immediate && !timeout;
        if (!timeout) timeout = setTimeout(later, wait);
        if (callNow) {
          result = func.apply(context, args);
          context = args = null;
        }

        return result;
      };
    },

    once: function(func) {
      var result;
      var wasCalled = false;

      return function() {
        if (wasCalled)
          return result;
        else {
          wasCalled = true;
          result = func.apply(this, arguments);
          func = null;
          return result;
        }
      };
    },

    // Retrieve the names of an object's own properties.
    // Delegates to **ECMAScript 5**'s native `Object.keys`
    keys: function(obj) {
      if (!_.isObject(obj)) return [];
      if (Object.keys) return Object.keys(obj);
      var keys = [];
      for (var key in obj) if (_.has(obj, key)) keys.push(key);
      return keys;
    },

    addEvent: function(el, type, callback) {
      if (window.addEventListener) { // modern browsers including IE9+
        el.addEventListener(type, callback, false);
      } else if (window.attachEvent) { // IE8 and below
        el.attachEvent('on' + type, callback);
      } else {
        el['on' + type] = callback;
      }
    },

    removeEvent: function(el, type, callback) {
      if (window.removeEventListener) {
        el.removeEventListener(type, callback, false);
      } else if (window.detachEvent) {
        el.detachEvent('on' + type, callback);
      } else {
        el['on' + type] = null;
      }
    },

    stopPropagation: function(type) {
      var e = type || window.event;
      e.cancelBubble = true;
      if (e.stopPropagation) e.stopPropagation();
    },

    // Checks if browser id IE 9 or lower
    isMsie: function() {
      if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
        var ieversion = +(RegExp.$1);
        if (ieversion < 10) {
          return true;
        }
      }
    },

    isUnsuported: function() {
      if (this.isMsie())
        return true;
      if (!window.postMessage)
        return true;
      if (!window.JSON)
        return true;
      if (!Function.prototype.bind)
        return true;
      try {
        window.postMessage('ping', '*');
      } catch (err) {
        return true;
      }

      return false;
    },

    // Empty link used to retrieve url parts in the
    // `getHost` and `getOrigin` methods
    emptyLink: window.document.createElement('a'),

    getHost: function(href) {
      this.emptyLink.href = href;
      return this.emptyLink.hostname;
    },

    getOrigin: function(url) {
      return url.replace(/([^:]+:\/\/[^\/]+).*/, '$1');
    },

    now: Date.now,

    onTransEnd: function(el, callback, args, context) {
      var cont = context || window;

      _.transEndEventName = _.transEndEventNames[_.cssPrefix('transition')];
      _.animEndEventName = _.animEndEventNames[_.cssPrefix('animation')];

      var cb = function(ev) {
        ev.stopPropagation();
        if (_.isFunction(callback)) {
          callback.call(cont, args);
        }

        _.removeEvent(el, _.transEndEventName, cb);
      };

      if (_.supports('transition')) { // Browser support for onEndAnim event
        _.addEvent(el, _.transEndEventName, cb);
      } else {
        if (_.isFunction(callback)) {
          setTimeout(function() {
            callback.call(cont, args);
          }, 300);

          // Arbitrary value... Shouldn't happen though,
          //cause myApp compatible browsers all support css animations/transitions
        }
      }
    },

    cssPrefix: function(suffix) {
      if (!suffix) { return ''; }

      var i, len;

      if (suffix.indexOf('-') >= 0) {
        var parts = (''+suffix).split('-');

        for (i=1, len=parts.length; i<len; i++) {
          parts[i] = parts[i].substr(0, 1).toUpperCase()+parts[i].substr(1);
        }
        suffix =  parts.join('');
      }

      if (suffix in document.body.style) {
        return suffix;
      }

      suffix = suffix.substr(0, 1).toUpperCase()+suffix.substr(1);

      var prefixes = ['webkit', 'Moz', 'ms', 'O'];
      for (i=0, len=prefixes.length; i<len; i++) {
        if (prefixes[i]+suffix in document.body.style) {
          return prefixes[i]+suffix;
        }
      }

      return '';
    },

    supports: function(property) {
      var b = document.body || document.documentElement;
      var s = b.style;
      var p = property;

      if (typeof s[p] == 'string') { return true; }

      // Tests for vendor specific prop
      var v = ['Moz', 'webkit', 'Webkit', 'Khtml', 'O', 'ms'];
      p = p.charAt(0).toUpperCase() + p.substr(1);

      for (var i=0; i<v.length; i++) {
        if (typeof s[v[i] + p] == 'string') { return true; }
      }

      return false;
    },

    animEndEventNames: {
      'WebkitAnimation': 'webkitAnimationEnd',
      'OAnimation': 'oAnimationEnd',
      'msAnimation': 'MSAnimationEnd',
      'animation': 'animationend'
    },

    transEndEventNames: {
      'WebkitTransition' : 'webkitTransitionEnd',// Saf 6, Android Browser
      'MozTransition'    : 'transitionend',      // only for FF < 15
      'transition'       : 'transitionend'       // IE10, Opera, Chrome, FF 15+, Saf 7+
    },

    /*!
     * contentloaded.js
     *
     * Author: Diego Perini (diego.perini at gmail.com)
     * Summary: cross-browser wrapper for DOMContentLoaded
     * Updated: 20101020
     * License: MIT
     * Version: 1.2
     *
     * URL:
     * http://javascript.nwbox.com/ContentLoaded/
     * http://javascript.nwbox.com/ContentLoaded/MIT-LICENSE
     *
     */

    // @win window reference
    // @fn function reference
    contentLoaded: function(win, fn) {

      var done = false, top = true,

      doc = win.document,
      root = doc.documentElement,
      modern = doc.addEventListener,

      add = modern ? 'addEventListener' : 'attachEvent',
      rem = modern ? 'removeEventListener' : 'detachEvent',
      pre = modern ? '' : 'on',

      init = function(e) {
        if (e.type == 'readystatechange' && doc.readyState != 'complete') return;
        (e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);
        if (!done && (done = true)) fn.call(win, e.type || e);
      },

      poll = function() {
        try { root.doScroll('left'); } catch(e) { setTimeout(poll, 50); return; }
        init('poll');
      };

      if (doc.readyState == 'complete') fn.call(win, 'lazy');
      else {
        if (!modern && root.doScroll) {
          try { top = !win.frameElement; } catch(e) { }
          if (top) poll();
        }
        doc[add](pre + 'DOMContentLoaded', init, false);
        doc[add](pre + 'readystatechange', init, false);
        win[add](pre + 'load', init, false);
      }

    }
  };

  // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

  // requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

  // MIT license
  (function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] ||
                                    window[vendors[x]+'CancelRequestAnimationFrame'];
      }

      if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - Math.abs(currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
      }

      if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
          clearTimeout(id);
        };
      }
  }());

  return _;

})();

