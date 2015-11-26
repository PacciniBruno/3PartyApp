/* eslint strict: false */
/* global window */

/**
 * The whole project will get wrapped in:
 *
 * (function(window, document, undefined) {
 *   (...)
 * })(this, document);
 *
 * In the build file created by the grunt task
 */

// Example of components, that represent a independant iframe and have
// an interface to communicate with the host via events.
// You can have only one, N, none
// (although that would kinda defeat the purpose of this "framework")
var app1Component   = require('./app1ExampleComponent.js');
var app2Component   = require('./app2ExampleComponent.js');

var hostComponent   = require('./hostComponent.js');
var mediator        = require('./mediator.js');
var sdk             = require('./sdk.js');
var _               = require('./utils.js');

// Reference to the myApp array queue created
// in snippet on publisher's website
var myAppq = window.myApp || [];

// IE version < 10 or unsupported features such as JSON or postMessage.
// Stop here, not supported
if (_.isUnsuported()) {
  throw Error('Navigator unsupported');
}

// Snippet version.
var snippetVersion = myAppq && myAppq.SNIPPET_VERSION ?
  parseFloat(myAppq.SNIPPET_VERSION, 10) : 0;

_.contentLoaded(window, initialize);

function initialize() {
  // Initialize host and other apps (app1 and app2 as an example)
  var host   = hostComponent().initialize();
  var app1   = app1Component().initialize();
  var app2   = app2Component().initialize();

  // Register the different component instances with a unique id
  mediator.registerApp(host, 'host');
  mediator.registerApp(app1, 'app1');
  mediator.registerApp(app2, 'app2');

  // Before swapping the global, replay an existing global `myApp` queue.
  while (myAppq && myAppq.length > 0) {
    var args = myAppq.shift();
    var method = args.shift();

    if (myApp[method]) {
      // call the method on sdk
      sdk[method].apply(myApp, args);
      sdk.calledBeforeLoad = true;
    }
  }
}

// Finally, replace the global queue with the public interface in sdk.
window.myApp = sdk;

// Set a flag to ensure non duplication of this code when using the snippet
window.myApp.initialized = true;

