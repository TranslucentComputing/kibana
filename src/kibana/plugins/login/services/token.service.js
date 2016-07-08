/**
 * Created by Daniel Costa <daniel@translucentcomputing.com> on 7/8/2016.
 */
define(function (require) {

  var app = require('modules').get('kibana');
  
  app.factory('TokenManager', function loginService(localStorageService) {
    return {
      setToken: function (token) {
        localStorageService.set('token', token);
      },
      removeToken: function () {
        localStorageService.remove('token');
      },
      getToken: function () {
        return localStorageService.get('token');
      },
      hasValidToken: function (token) {
        return token && token.expires_at && token.expires_at > new Date().getTime();
      },
      clearAll: function () {
        localStorageService.clearAll();
      },
      getSessionKey: function(){
        var token = this.getToken();
        if(token && token.session_key){
          return token.session_key;
        }
        else {
          return null;
        }
      }
    }
  });

});
