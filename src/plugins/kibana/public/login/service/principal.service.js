define(function (require) {

  var app = require('modules').get('kibana');
  var angular = require('angular');

  app.factory('Principal', function Principal($q, $http) {
    var _identity;
    var _authenticated = false;
    var _useHierarchy = false;

    var patternHierarchy = /\s*([^\\s>]+)\s*>\s*([^\s>]+)/g;
    var rolesReachableInOneStepMap = {};
    var rolesReachableInOneOrMoreStepsMap = {};

    function buildRolesReachableInOnStep() {
      var m;

      while ((m = patternHierarchy.exec(_identity.setting.rolesHierarchy)) !== null) {
        var higherRole = m[1].trim();
        var lowerRole = m[2].trim();

        if (!rolesReachableInOneStepMap.hasOwnProperty(higherRole)) {
          rolesReachableInOneStepMap[higherRole] = [];
        }

        var rolesReachableInOneStep = rolesReachableInOneStepMap[higherRole];

        if (rolesReachableInOneStep.indexOf(lowerRole) === -1) {
          rolesReachableInOneStep.push(lowerRole);
        }
      }
    }

    function updateRolesToVisit(rolesToVisit, newReachableRoles) {
      angular.forEach(newReachableRoles, function (item) {
        rolesToVisit.push(item);
      });
    }

    function buildRolesReachableInOneOrMoreStepsMap() {
      for (var role in rolesReachableInOneStepMap) {
        if (rolesReachableInOneStepMap.hasOwnProperty(role)) {
          var rolesToVisit = [];
          if (rolesReachableInOneStepMap.hasOwnProperty(role)) {
            rolesToVisit = angular.copy(rolesReachableInOneStepMap[role]);
          }

          var visitedRoles = [];
          for (var iR = 0; iR < rolesToVisit.length; iR++) {
            var aRole = rolesToVisit[iR];
            if (visitedRoles.indexOf(aRole) === -1) {
              visitedRoles.push(aRole);
            }

            if (rolesReachableInOneStepMap.hasOwnProperty(aRole)) {
              var newReachableRoles = rolesReachableInOneStepMap[aRole];

              if (rolesToVisit.indexOf(role) !== -1 || visitedRoles.indexOf(role) !== -1) {
                throw new Error('Cycle In Role Hierarchy');
              }
              else {
                updateRolesToVisit(rolesToVisit, newReachableRoles);
              }
            }
          }

          rolesReachableInOneOrMoreStepsMap[role] = visitedRoles;
        }
      }
    }

    return {

      getRolesReachableInOneOrMoreSteps: function (authority) {
        if (!authority) return null;

        for (var role in rolesReachableInOneOrMoreStepsMap) {
          if (role === authority) {
            return rolesReachableInOneOrMoreStepsMap[role];
          }
        }

        return null;
      },

      getReachableGrantedAuthorities: function (authorities) {
        if (!authorities)
          return [];

        var reachableRoles = [];
        var self = this;
        angular.forEach(authorities, function (authority) {
          if (reachableRoles.indexOf(authority) === -1) { //add granted user authorities to reachable ones
            reachableRoles.push(authority);
          }

          var additionalReachableRoles = self.getRolesReachableInOneOrMoreSteps(authority);
          if (additionalReachableRoles) {
            angular.forEach(additionalReachableRoles, function (item) {
              reachableRoles.push(item);
            });
          }
        });

        return reachableRoles;
      },

      isIdentityResolved: function () {
        return angular.isDefined(_identity);
      },

      isAuthenticated: function () {
        return _authenticated;
      },

      isAdmin: function (authority) {
        if (!authority) {
          return this.isInRole(_identity.setting.adminAuthority);
        }
        else {
          return _identity.setting.adminAuthority === authority;
        }
      },

      isInRole: function (role) {
        if (!_authenticated || !_identity || !_identity.authorities) {
          return false;
        }

        if (_useHierarchy) {
          var reachable = this.getReachableGrantedAuthorities(_identity.authorities);
          return reachable.indexOf(role) !== -1;
        }
        else {
          return _identity.authorities.indexOf(role) !== -1;
        }
      },

      isInAnyRole: function (authorities) {
        if (!_authenticated || !_identity.authorities) {
          return false;
        }

        for (var i = 0; i < authorities.length; i++) {
          if (this.isInRole(authorities[i])) {
            return true;
          }
        }

        return false;
      },

      authenticate: function (identity) {
        _identity = identity;
        _authenticated = identity !== null;
      },

      identity: function (force) {
        var deferred = $q.defer();

        if (force === true) {
          _identity = undefined;
        }

        // check and see if we have retrieved the identity data from the server.
        // if we have, reuse it by immediately resolving
        if (angular.isDefined(_identity)) {
          deferred.resolve(_identity);

          return deferred.promise;
        }

        // retrieve the identity data from the server, update the identity object, and then resolve.
        $http.get('auth/user')
          .then(function (account) {
            _identity = account.data;
            _useHierarchy = _identity.setting && _identity.setting.useHierarchy && _identity.setting.useHierarchy === true;
            if (_useHierarchy) {
              buildRolesReachableInOnStep();
              buildRolesReachableInOneOrMoreStepsMap();
            }
            _authenticated = true;
            deferred.resolve(_identity);
          })
          .catch(function () {
            _identity = null;
            _authenticated = false;
            deferred.resolve(_identity);
          });

        return deferred.promise;
      }
    };
  });

});
