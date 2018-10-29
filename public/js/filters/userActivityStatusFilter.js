'use strict';

/* Filters */
// user role based on the nuber value
app.filter('toStatusStr', function() {
  return function(val) {
    return val ? 'Active' : 'Disabled';
  }
});
