/* jshint strict: false */
var _      = require('./utils.js');
var Events = require('./Events.js');

module.exports = function() {

  var component = {

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
        _.each(stylesObj, function(value, property) {
          style.setProperty(property, '' + value, 'important');
        }) ;
      } else {
        _setInlineStyleCompat(el, stylesObj);
      }
    },

    removeInlineStyle: function(el, property) {
      var style = el.style;
      if ('removeProperty' in style) {
        style.removeProperty(property);
      } else {
        _removeInlineStyleCompat(property);
      }
    },

    delegateEvents: function(other, events, ctx) {
      if (!events) return this;
      this.undelegateEvents(other || this);
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[method];
        if (!method) continue;
        this.listenTo(other || this, key, _.bind(method, ctx || this));
      }
      return this;
    },

    undelegateEvents: function(obj) {
      this.stopListening(obj || this);
    },

    forwardStateChangeEvents: function(eventBus, states, context) {
      if (!states) return this;
      _.each(states, function(value, state) {
        var eventName = 'change:' + state;

        // Listen to internal change events and forward to the mediator
        context.on(eventName, function() {

          // Turn arguments into a real array (not array-like object)
          var args = [].slice.call(arguments);

          // Set the first argument to be the event name
          args.unshift(this.uid + '.' + eventName);

          // Call trigger with the proper arguments using apply
          eventBus.trigger.apply(eventBus, args);
        });
      });
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
    },

  };

  _.extend(component, Events);

  function _setInlineStyleCompat(el, stylesObj) {
    var props = [];
    _.each(stylesObj, function(value, property) {
      props.push(property + ':' + value + ' !important');
    });

    el.style.cssText = props.join(';');
  }

  function _removeInlineStyleCompat() {
    this._setInlineStyleCompat({});
  }

  return component;
};
