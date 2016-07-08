define(function (require) {

  require('plugins/login/services/base64.service');
  require('plugins/login/services/token.service');

  var app = require('modules').get('kibana');

  require('routes')
    .when('/login',{
      template: require('text!plugins/login/index.html'),
      reloadOnSearch: false,
      resolve: {}
    });

  app.factory('AuthService', function loginService($http,Base64, TokenManager, $rootScope, Principal, $location) {
    var tokenUri = "http://localhost:8080/oauth/token"; //TODO update
    return {
      login: function (credentials) {
        var data = "username=" + credentials.username + "&password="
          + credentials.password + "&grant_type=password&scope=read%20write&" +
          "client_secret=KibanaAppSecret&client_id=KibanaApp";

        return $http.post(tokenUri, data, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json",
            "Authorization": "Basic " + Base64.encode("KibanaApp" + ':' + "KibanaAppSecret")
          }
        }).then(function (response) {
          var token = response.data;
          var expiredAt = new Date();
          expiredAt.setSeconds(expiredAt.getSeconds() + token.expires_in);
          token.expires_at = expiredAt.getTime();
          TokenManager.setToken(token);
          return token;
        });
      },
      logout: function () {
        // logout from the server
        var sessionKey = TokenManager.getSessionKey();

        $rootScope.$broadcast('loggedOut');
        Principal.authenticate(null);

        $http.get('/api/logout',{params:{sessionKey:sessionKey}}).then(function () {
          TokenManager.clearAll();
          $location.path("/login");
        });
      },
      authorize: function (force) {
        return Principal.identity(force)
          .then(function () {
            var isAuthenticated = Principal.isAuthenticated();

            if(!isAuthenticated){
              $location.path('/login');
            }

          });
      }
    };
  });

});
