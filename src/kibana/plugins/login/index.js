define(function (require) {

  var angular = require('angular');

  var app = require('modules').get('app/login', [
    'ngRoute',
    'kibana/config'
  ]);

  require('routes')
    .when('/login', {
      template: require('text!plugins/login/index.html'),
      reloadOnSearch: true
    });

  app.controller('login', function ($rootScope, $scope, configFile, AuthService, Principal, TokenManager, Notifier, kbnUrl) {
    var vm = this;

    var notify = new Notifier();

    vm.init = function () {
      if (Principal.isAuthenticated()) {
        kbnUrl.change('/' + configFile.default_app_id, {});
      }
    };

    vm.credentials = {
      username: '',
      password: ''
    };

    vm.login = function () {
      if (!!TokenManager.getToken()) {
        TokenManager.clearAll(); // if we have any token, let's clear it
      }
      AuthService.login(vm.credentials)
        .then(function (data) {
          // retrieve the logged account information
          Principal.identity(true)
            .then(function (account) {
              $rootScope.$broadcast('loggedIn');
              $scope.$emit('application.load');
              kbnUrl.change('/' + configFile.default_app_id, {});
            });
        })
        .catch(function (err) {
          if (err.status === 400 && err.data.error
            && err.data.error === 'invalid_grant' && err.data.error_description.indexOf('locked') > -1) {
            notify.error('User account is locked. Contact an administrator to unlock your account or reset your password.');
          } else if (err.status === 401) {
            notify.error(err.data.error_description);
          }
          else {
            notify.error('Authentication failed! Please check your credentials and try again.');
          }
        });
    };

    vm.init();
  });

  var apps = require('registry/apps');
  apps.register(function LoginAppModule() {
    return {
      id: 'login',
      name: 'Login',
      order: -3
    };
  });

});
