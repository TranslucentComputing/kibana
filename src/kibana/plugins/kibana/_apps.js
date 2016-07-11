define(function (require) {
  return function KbnControllerApps(Private, $rootScope, $scope, $location, globalState, sessionStorage, AuthService) {
    var _ = require('lodash');

    function appKey(app) {
      return 'lastPath:' + app.id;
    }

    function assignPaths(app) {
      app.rootPath = '/' + app.id;
      app.lastPath = sessionStorage.get(appKey(app)) || app.rootPath;
      return app.lastPath;
    }

    function getShow(app) {
      app.show = app.order >= 0 ? true : false;
    }

    function setLastPath(app, path) {
      app.lastPath = path;
      return sessionStorage.set(appKey(app), path);
    }

    $scope.apps = Private(require('registry/apps'));
    // initialize each apps lastPath (fetch it from storage)
    $scope.apps.forEach(assignPaths);
    $scope.apps.forEach(getShow);

    /**
     * Fired before the route change
     * @param event
     * @param next
     * @param current
     */
    function beforeRouteChange(event, next, current) {
      $rootScope.nextState = next;
      var nextAppRoute = next.$$route.originalPath.split('/')[1];
      $scope.apps.forEach(function (app) { //Find the app that belongs to the next route
        if (app.id === nextAppRoute) {
          $rootScope.nextApp = app;
        }
      });
      AuthService.authorize(true); //let's force a rest call in every state change, so we can check the Auth.
    }

    /**
     * Fired after the route change
     */
    function onRouteChange() {
      var route = $location.path().split(/\//);
      $scope.apps.forEach(function (app) {
        if (app.active = app.id === route[1]) {
          $rootScope.activeApp = app;
        }
      });

      if (!$rootScope.activeApp || $scope.appEmbedded) return;

      // Record the last URL w/ state of the app, use for tab.
      setLastPath($rootScope.activeApp, globalState.removeFromUrl($location.url()));
    }

    $rootScope.$on('$routeChangeStart', beforeRouteChange);
    $rootScope.$on('$routeChangeSuccess', onRouteChange);
    $rootScope.$on('$routeUpdate', onRouteChange);
  };
});
