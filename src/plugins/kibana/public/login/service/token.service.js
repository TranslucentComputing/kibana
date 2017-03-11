define(function (require) {

  var app = require('modules').get('kibana');

  app.factory('TokenManager', function loginService(sessionStorage) {
    return {
      setToken: function (token) {
        sessionStorage.set('token', token);
      },
      removeToken: function () {
        sessionStorage.remove('token');
      },
      getToken: function () {
        return sessionStorage.get('token');
      },
      hasValidToken: function (token) {
        return token && token.expires_at && token.expires_at > new Date().getTime();
      },
      clearAll: function () {
        sessionStorage.clear();
      },
      getSessionKey: function () {
        var token = this.getToken();
        if (token && token.session_key) {
          return token.session_key;
        }
        else {
          return null;
        }
      }
    };
  });

});
