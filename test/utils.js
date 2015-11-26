'use strict';

module.exports = {
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
