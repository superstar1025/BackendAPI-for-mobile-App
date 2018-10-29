'use strict';

/* Filters */
// need load the moment.js to use this filter.
app.filter('extractName', function() {
  return function(item) {
    if (item.hub) {
      return item.hub.description;
    }
    if (item.event) {
      return item.event.name;
    }
    if (item.business) {
      return item.business.name;
    }
    return 'Not available!'
  }
});

app.filter('extractId', function() {
  return function(item) {
    if (item.hub) {
      return item.hub._id;
    }
    if (item.event) {
      return item.event._id;
    }
    return null;
  }
});
