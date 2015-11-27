# 3PartyApp

A "framework" for building 3rd party apps using Iframes.
Design inspired by Backbone.js

Documentation to come. Still a work in progress. Clean up very much needed. Example(s) needed.

Also, a custom build tool for enabling/disabling optional features (sdk, cross domain iframe messaging...) would be useful.

Test coverage isn't 100% yet. Notably utility methods and Event module aren't tested yet (mostly taken from backbone and underscore, respectively)

## What is that thing for ?

- Makes communication between a host site and Cross Domain iframe(s) easy.
- Use a central event Bus to pass information between Iframes
- Easily expose an SDK like interface on the host site to allow publisher to interact with you app(s)

## Support

Mostly tested on Chrome, Firefox and IE11. Should work ok on IE10, not tested though.

## Build

run `grunt build` to build both the snippet and the loader script.
