/* jshint strict: false */
var Component = require('./Component.js');
var mediator  = require('./mediator.js');
var xdm       = require('./xdm.js');
var _         = require('./utils.js');

var iframeSrc = '{{ path_to_my_frame_1 }}';

var elOptions = {
  tagName: 'iframe',
  attrs: {
    id: 'app1-id',
    allowTransparency: 'true',
    frameBorder: '0',
    scrolling: 'yes',
    name: 'app1_name',
    role: 'dialog',
    src: iframeSrc
  },

  container: {
    tagName: 'div',
    attrs: {
      id: 'app1-container',
      class: 'hidden-animation-state'
    },
    styles: {
      display: 'none'
    }
  }
};

var App1Component = Component.extend({

  // Create a unique identifier for the app1 App
  // that will be used to identify the iframed myApp app
  // to ensure a secured communication between host && client
  // using the postMessage api.
  uid: 'app1',

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
  // Uses event delegation for efficiency.
  events: {
    'app1.load': 'onLoad',
    'app1.ready': 'onReady'
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
    this.el = this.render(this.elOptions);

    // Keep a reference to the iframe window object.
    // Will be used later to send messages using postMessage.
    // Child iframe window object can also be found in the "frame" array
    this.frame = document.getElementById(this.frameId).contentWindow;

    return Component.prototype.initialize.call(this, mediator);
  },

  render: function(options) {
    if (!options) { return null; }

    // Create dom elements
    var $app1Container = this.createEl(options.container);
    var $app1Iframe    = this.createEl(options);

    // Insert dom elements in the host site dom
    this.insertInContainer($app1Container, document.body);
    this.insertInContainer($app1Iframe, $app1Container);

    return $app1Container;
  },

  onLoad: function() {
    this.setState('load', true);

    // For example, send informations about the host to app1 iframe
    // for tracking purposes
    this.sendMessage('host.sendInfo', {
      host: window.location.host || null,
      path: window.location.pathname || null,
      href: window.location.href || null,
      protocol: window.location.protocol || null,
      referrer: document.referrer || null
    });
  },

  onReady: function(options) {
    this.setState('ready', true);

    // Do something when app1 is ready
    mediator.trigger('app1.doSomething', options);
  }

});

_.extend(App1Component.prototype, xdm);

module.exports = App1Component;
