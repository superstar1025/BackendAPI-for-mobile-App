/**
 * This service adds a delay before executing a function. It ensures that the
 * function is called once before the delay is reached.
 */
'use strict';
app.service('Delay', ['$timeout', function($timeout) {
  var functions = {};

  var obj = {
    execute: function(fn, delay) {
      if (functions[fn]) {
        $timeout.cancel(functions[fn]);
        delete functions[fn];
      }

      functions[fn] = $timeout(function() {
        fn();
      }, delay);
    }
  };

  return obj;
}]);
