define(function (require) {

  var _ = require('lodash');
  var angular = require('angular');

  var app = require('modules').get('kibana');

  require('plugins/login/services/auth.service');
  require('plugins/login/services/principal.service');

  require('routes')
    .when('/login', {
      template: require('text!plugins/login/index.html'),
      reloadOnSearch: false,
      resolve: {}
    });

  app.controller('LoginController', function (AuthService, Principal, $rootScope, TokenManager, $location) {
    var vm = this;

    vm.init = function(){
      if(Principal.isAuthenticated()){
        $location.path("/discover");
      }
    };

    vm.credentials = {
      username: "",
      password: ""
    };

    vm.login = function () {
      if(!!TokenManager.getToken()){
        TokenManager.clearAll(); // if we have any token, let's clear it
      }
      AuthService.login(vm.credentials)
        .then(function (data) {
          // retrieve the logged account information
          Principal.identity(true).then(function (account) {
            $rootScope.$broadcast('loggedIn');
            $location.path('/discover');
          });
        })
        .catch(function (err) {
          alert('INVALID LOGIN');
          //TODO handle invalid login
        });
    };

    vm.init();
  });

});
