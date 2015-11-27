
var _         = require('./utils.js');
var Events    = require('./Events.js');
var Component = require('./Component.js');

/**
 * The mediator object is a singleton that will be used as a global event bus by a frame app
 * like app1 or app2, to communicate across apps without needing
 * knowledge of the internals of the others
 *
 * It also has utility methods attatched to it, to set/get a registered app
 *
 */
module.exports = (function() {

  var _appsRegistry = {};

  var mediator = _.extend({

    events: {
      // Process events comming from all apps.
      // If you want each app to ignore the other one's existance,
      // you can heve this mediator handle the communication logic beetween them
      // (state forwarding...)
    },

    initialize: function() {

      // Create listeners for the events listed in the 'events' objects
      this.delegateEvents(mediator, this.events, this);
      return this;
    },

    /**
     * Access and store the components in a central registory
     */

    registerApp: function(frame, uid) {
      _appsRegistry[uid] = frame;
      return frame;
    },

    getRegisteredApp: function(uid) {
      return _appsRegistry[uid] || undefined;
    },

    unRegisterApp: function(uid) {
      delete _appsRegistry[uid];
    }

  }, Events);

  return mediator.initialize();

})();
