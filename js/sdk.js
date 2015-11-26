var _        = require('./utils.js');
var mediator = require('./mediator.js');

module.exports = (function() {

  // Any sdk method was called using the myApp public object
  // before all the scripts were loaded
  var calledBeforeLoad = false;

  // Can be triggered on the host website using the sdk
  var apiMethods = {
    // Example method that could be useful from the host website
    'my.api.method': function() {
      console.log('my.api.method was called');
    },

    'app1.show': function() {
      mediator.trigger('app1.show');
    },

    'app1.hide': function() {
      mediator.trigger('app1.hide');
    },

    'app1.onShow': function(callback) {
      if (_.isFunction(callback)) {
        mediator.on('app1.onShow', callback, {});
      }
    },

    // Should only be registered once. If it happens to be registered multiple time,
    // return previous return value.
    'app.onReady': function(callback) {
      return _.once(function() {
        var app1 = mediator.getRegisteredApp('app1');

        if (_.isFunction(callback)) {
          if (app1.getState('ready')) {
            return callback();
          }
          mediator.once('app1.onReady', callback, {});
        }
      });
    }
  };

  // any api method can be called on the host website by using:
  // `myApp.api('method.name', argsObj);
  function api(name, obj) {
    if (!_.isString(name)) {
      throw Error('first argument should be a string');
    }

    if (apiMethods[name]) {
      return apiMethods[name].call(this, obj);
    } else {
      console.warn('unknown api method name: "' + name.toString() +
        '" see api documentation at: {{ documentation url }}');
    }
  }

  return {
    api: api,
    calledBeforeLoad: calledBeforeLoad
  };

})();
