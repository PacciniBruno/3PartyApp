var sdk      = require('../../js/sdk.js');
var mediator = require('../../js/mediator.js');
var utils    = require('../utils.js');
var test     = require('tape');

utils.contentLoaded(window, function() {

  // Ugly: Don't run the following tests in PhantomJS. Async webpack require won't work there.
  // Couldn't investigate why yet.
  if (/PhantomJS/.test(window.navigator.userAgent)) {
    return;
  }

  /**
   * Subset of the snippet code relevant to our test. see `snippet.js`
   */
  function beforeRequireMain() {

    // Create a queue, but don't obliterate an existing one!
    var myApp = window.myApp = window.myApp || [];

    myApp.methods = [
      'api'
    ];

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
  }

  test('calls to the public myApp api made before the app2 script was loaded get called eventually', function(assert) {

    var apiSpy = sinon.spy(sdk, 'api');

    // Create a myApp object on window with fake `myApp.api` method.
    // Same logic as in `snippet.js`
    beforeRequireMain();

    // Call a fake api method, with a valid argument
    window.myApp.api('my.api.method');

    // Requiring `main.js` will instanciate
    // all modules, and calls to and `api` that were made
    // before the require will get dequeued only then.
    require('../../js/main.js');

    assert.ok(apiSpy.calledWith('my.api.method'), 'myApp.api was called');

    // asynchronous dequeue and method invocation works as expected
    assert.ok(sdk.calledBeforeLoad, 'api was called before the sdk module existed');

    // Clean up
    sdk.calledBeforeLoad = false;
    sdk.api.restore();
    assert.end();
  });

  test('Both app2 and app1 apps now exist and their respective elements are in the dom', function(assert) {

    // refs to the modules instanciated in `main.js` that created elements in the dom.
    // Used to clean up after the tests
    var app1 = mediator.getRegisteredApp('app1');
    var app2 = mediator.getRegisteredApp('app2');

    assert.equal(document.getElementById(app1.id), app1.el);
    assert.equal(document.getElementById(app2.id), app2.el);

    // Injecting main means that app1 and app2 were instanciated
    // and initialized. Render was called on initialize and elements were created.
    // we remove them now
    app2.remove();
    app1.remove();
    assert.end();
  });

  test('global myApp object exposes the sdk interface', function(assert) {
    assert.ok(window.myApp.hasOwnProperty('api'));
    assert.end();
  });

});
