'use strict';
app.service('NetminoUtils', [
  'growl',
  'blockUI',
  function(
    growl,
    blockUI) {

    var _removeBlockUI = function() {
      var blockablePublishEventUI = blockUI.instances.get('blockablePublishEventUI');
      blockablePublishEventUI.stop();
    };

    this.handleError = function(err) {
      _removeBlockUI();
      var msg = err.error.message || err.error || err;
      console.error(msg);
      growl.addErrorMessage(msg);
    }
  }]);
