/* jshint strict: false */
var _      = require('./utils.js');
var Events = require('./Events.js');

function Component() {}

_.extend(Component.prototype, {

  // Component frame will be given the iframe window when inserted in the dom
  frame: undefined,

  // Will be set when creating the dom element
  el: undefined,

  // A map of events for this object
  // Callbacks will be bound to the "view", with `this` set properly.
  // Uses event delegation for efficiency.
  events: {},

  // A map of states for the component.
  // Should not be modified or accessed directly (e.g: `this.state['ready']`)
  // Use getter/setters instead (e.g: `this.getState('ready')`)
  //
  // Note: setState should not be called from another component. State changes
  // have to be made internally.
  state: {},

  // Initialize binds events in the event map to the mediator. Extend it with your own
  // initialization logic.
  initialize: function(mediator) {

    // Create listeners for the events listed in the 'events' objects
    this.delegateEvents(mediator, this.events, this);

    // Forward change events triggered on state change to the event bus
    this.forwardStateChangeEvents(mediator, this.state, this);

    return this;
  },

  // **render** is the core function that your view should override, in order
  // to populate its element (`this.el`), with the appropriate HTML. The
  // convention is for **render** to always return `this.el`.
  render: function() {
    return this.el;
  },

  // Get the value of a state set in the state map
  getState: function(state) {
    return this.state[state];
  },

  // Set the value of a state in the state map.
  // Changes to a state will trigger an event.
  setState: function(state, value) {
    var previous = this.state[state];
    this.state[state] = value;

    if (typeof previous !== 'undefined' && value !== previous) {
      this.trigger('change', this.state);
      this.trigger('change:' + state, value);
    }
  },

  createEl: function(options) {
    var $el = document.createElement(options.tagName || 'div');

    $el.innerHTML = options.html || '';
    this.setAttributes($el, options.attrs);
    this.setInlineStyle($el, options.styles);
    return $el;
  },

  insertInContainer: function(el, container) {
    if (_.isString(container)) {
      container = document.getElementById(container);
    }

    return container.appendChild(el);
  },

  hide: function() {
    this.setInlineStyle(this.el, 'display', 'none');
    window.focus();
  },

  show: function() {
    this.removeInlineStyle(this.el, 'display');
  },

  setAttributes: function(element, attributes) {
    _.each(attributes, function(value, attribute) {
      element.setAttribute(attribute, value);
    });
  },

  setInlineStyle: function(el, property, value) {
    var stylesObj = {};
    var style = el.style;

    // Single property
    if (_.isString(property)) {
      stylesObj[property] = value;
    } else { // Object with one or more properties
      stylesObj = property;
    }

    // IE > 9
    if ('setProperty' in style) {
      _.each(stylesObj, function(val, prop) {
        style.setProperty(prop, '' + val, 'important');
      });
    } else {
      setInlineStyleCompat(el, stylesObj);
    }
  },

  removeInlineStyle: function(el, property) {
    var style = el.style;
    if ('removeProperty' in style) {
      style.removeProperty(property);
    } else {
      removeInlineStyleCompat(property);
    }
  },

  removeEl: function() {
    if (this.el) {
      this.el.parentNode.removeChild(this.el);
    }
    return this;
  },

  remove: function() {
    this.removeEl();
    this.stopListening();
    return this;
  }

}, Events);

function setInlineStyleCompat(el, stylesObj) {
  var props = [];
  _.each(stylesObj, function(value, property) {
    props.push(property + ':' + value + ' !important');
  });

  el.style.cssText = props.join(';');
}

function removeInlineStyleCompat() {
  this.setInlineStyleCompat({});
}

// Helpers
// -------

// Taken from Backbone
// Helper function to correctly set up the prototype chain for subclasses.
// Similar to `goog.inherits`, but uses a hash of prototype properties and
// class properties to be extended.
var extend = function(protoProps) {
  var parent = this;
  var child = function() { return parent.apply(this, arguments); };

  // Set the prototype chain to inherit from `parent`, without calling
  // `parent` constructor function.
  var Surrogate = function() { this.constructor = child; };
  Surrogate.prototype = parent.prototype;
  child.prototype = new Surrogate;

  // Add prototype properties (instance properties) to the subclass,
  // if supplied.
  if (protoProps) { _.extend(child.prototype, protoProps); }

  return child;
};

Component.extend = extend;

module.exports = Component;
