/* jshint strict: false */
var mediator  = require('./mediator.js');
var Component = require('./Component.js');
var xdm       = require('./xdm.js');
var _         = require('./utils.js');

var iframeSrc = '{{ path_to_my_frame_2 }}';

var elOptions = {
  tagName: 'iframe',

  attrs: {
    id: 'app2-id',
    allowTransparency: 'true',
    frameBorder: '0',
    scrolling: 'yes',
    name: 'app2_name',
    role: 'dialog',
    src: iframeSrc
  },

  container: {
    tagName: 'div',
    attrs: {
      id: 'app2-container',
      class: 'hidden-animation-state'
    },
    styles: {
      display: 'none'
    }
  }
};

var App2Component = Component.extend({

  // Create a unique identifier for the app1 App
  // that will be used to identify the iframed myApp app
  // to ensure a secured communication between host && client
  // using the postMessage api.
  uid: 'app2',

  // Will be used as src for the iframe
  target: iframeSrc,

  // Origin part of the target url
  origin: _.getOrigin(iframeSrc),

  // Host part of the target url
  host: _.getHost(iframeSrc),

  elOptions: elOptions,

  // Html id for the element
  id: elOptions.container.attrs.id,

  // HTML id for the iframe
  frameId: elOptions.attrs.id,

  // A map of events for this object
  // Callbacks will be bound to the "view", with `this` set properly.
  // Uses event delegation for efficiency and readability.
  events: {
    'app2.load': 'onLoad',
    'app2.ready': 'onReady',
    'app1.doSomething': 'onApp1DoSomething'
  },

  // A map of states for the component.
  // Should not be modified or accessed directly (e.g: `this.state['ready']`)
  // Use getter/setters instead (e.g: `this.getState('ready')`)
  //
  // Note: setState should not be called from another component. State changes
  // have to be made internally.
  state: {
    load: false,
    ready: false
  },

  initialize: function() {
    this.el = this.render(elOptions);

    // Keep a reference to the iframe window object.
    // Will be used later to send messages using postMessage.
    // Child iframe window object can also be found in the "frame" array
    this.frame = document.getElementById(this.frameId).contentWindow;

    // Post render DOM Events binding
    this.registerDomEvents();

    return Component.prototype.initialize.call(this, mediator);
  },

  // TODO: abstract some of this logic in Component.js
  render: function(options) {
    if (!options) { return null; }

    // Create dom elements
    var $app2Container = this.createEl(options.container);
    var $app2Iframe    = this.createEl(options);

    // Insert dom elements in the host site dom
    this.insertInContainer($app2Container, document.body);
    this.insertInContainer($app2Iframe, $app2Container);

    return $app2Container;
  },

  registerDomEvents: function() {
    _.addEvent(this.el, 'click', _.bind(this.onApp2Click, this));
  },

  onLoad: function() {
    this.setState('load', true);
  },

  onReady: function() {
    this.setState('ready', true);
  },

  onApp2Click: function() {
    mediator.trigger('app2.clicked');
  },

  onApp1DoSomething: function() {
    this.sendMessage('app2:app1DidSomthing');
  }

});

_.extend(App2Component.prototype, xdm);

module.exports = App2Component;
