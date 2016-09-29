define(function (require) {

  var app = require('modules').get('kibana');

  app.factory('AuthInterceptor', function ($q, $injector, TokenManager) {
    var authInterceptorServiceFactory = {};

    var _request = function (config) {

      config.headers = config.headers || {};
      var token = TokenManager.getToken();

      if (TokenManager.hasValidToken(token)) {
        config.headers.Authorization = 'Bearer ' + token.access_token;
      }

      return config;
    };

    var _responseError = function (response) {
      // token has expired
      if (response.status === 401 && (response.data.error.toLowerCase() === 'invalid_token'
        || response.data.error.toLowerCase() === 'unauthorized')) {
        if (response.data.error === 'invalid_token') {
          TokenManager.removeToken();
        }
        var Principal = $injector.get('Principal');
        if (Principal.isAuthenticated()) {
          var AuthService = $injector.get('AuthService');
          AuthService.authorize(true);
        }
      }
      return $q.reject(response);
    };

    authInterceptorServiceFactory.request = _request;
    authInterceptorServiceFactory.responseError = _responseError;

    return authInterceptorServiceFactory;
  });

});
