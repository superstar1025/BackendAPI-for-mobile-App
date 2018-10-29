/* added per
 - https://github.com/angular-ui/bootstrap/issues/3033
 - https://github.com/angular-ui/bootstrap/issues/2659#issuecomment-60750976
 */
angular.module('app')
  .directive('datepickerPopup', function() {
    return {
      restrict: 'EAC',
      require: 'ngModel',
      link: function(scope, element, attr, controller) {
        //remove the default formatter from the input directive to prevent conflict
        controller.$formatters.shift();
      }
    }
  });
