/**
 * Created by Daniel Costa <daniel@translucentcomputing.com> on 7/8/2016.
 */
define(function (require) {

  var app = require('modules').get('kibana');

  app.factory('AuthInterceptor', function ($q, $injector, TokenManager, configFile) {
    var authInterceptorServiceFactory = {};

    var _request = function (config) {
      //update url for api calls
      if (/^\/api\//.test(config.url)) {
        config.url = configFile.api_url + config.url;
      }

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
