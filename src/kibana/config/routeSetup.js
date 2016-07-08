/**
 * Created by Daniel Costa <daniel@translucentcomputing.com> on 7/8/2016.
 */
define(function (require) {

  var app = require('modules').get('kibana');

  app.factory('RouteSetup', function ($rootScope, $window, Principal, AuthService) {
    return {
      setup: function () {

        $rootScope.$on('$routeChangeStart', function (event, next, current) {
          $rootScope.nextState = next;

          AuthService.authorize();
        });
      }
    }
  });

});
