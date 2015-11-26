// Heavily inspired by segment analytics.js loader
;(function (window, undefined) {
  'use strict';

  // Create a queue, but don't obliterate an existing one!
  var myApp = window.myApp = window.myApp || [];

  // If the real loader.js is already on the page return.
  if (myApp.initialized) return;

  // If the snippet was invoked already show an error.
  if (myApp.invoked) {
    if (window.console && console.error) {
      console.error('myApp snippet included twice.');
    }
    return;
  }

  // Invoked flag, to make sure the snippet
  // is never invoked twice.
  myApp.invoked = true;

  // A list of the methods in loader.js to stub. For now just one: api.
  myApp.methods = [
    'api',
  ];

  // Define a factory to create stubs. These are placeholders
  // for methods in loader.js so that you never have to wait
  // for it to load to actually record data. The `method` is
  // stored as the first argument, so we can replay the data.
  myApp.factory = function(method) {
    return function() {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(method);
      myApp.push(args);
      return myApp;
    };
  };

  // For each of our methods, generate a queueing stub.
  for (var i = 0; i < myApp.methods.length; i++) {
    var key = myApp.methods[i];
    myApp[key] = myApp.factory(key);
  }

  // Define a method to load loader.js from our CDN,
  // and that will be sure to only ever load it once.
  myApp.load = function(key) {
    // Create an async script element based on your key.
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = ('https:' === document.location.protocol ?
    'https://' : 'http://') + '{{path_to_my_3PartyApp}}' + key;

    // Insert our script next to the first script element.
    var first = document.getElementsByTagName('script')[0];
    first.parentNode.insertBefore(script, first);
  };

  // Add a version to keep track of what's in the wild.
  myApp.SNIPPET_VERSION = '1.0.0';

})(this);
