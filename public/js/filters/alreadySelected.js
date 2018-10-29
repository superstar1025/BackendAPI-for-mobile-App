'use strict';

app.filter('areadySelected', function() {
  return function(items, selected) {
    if (!items || !selected) {
      return [];
    }
    var onlyInItems = items.filter(function(current) {
      return selected.filter(function(currentB) {
          return currentB._id == current._id
        }).length == 0
    });
    return onlyInItems;
  }
});
