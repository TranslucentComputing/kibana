require('plugins/kibana/discover/index');
require('plugins/kibana/visualize/index');
require('plugins/kibana/dashboard/index');
require('plugins/kibana/settings/index');
require('plugins/kibana/doc/index');
require('ui/timepicker');

const moment = require('moment-timezone');

const chrome = require('ui/chrome');
const routes = require('ui/routes');
const modules = require('ui/modules');

const kibanaLogoUrl = require('ui/images/kibana.svg');

routes.enable();

routes
.otherwise({
  redirectTo: `/${chrome.getInjected('kbnDefaultAppId', 'discover')}`
});

chrome
.setBrand({
  'logo': 'url(' + kibanaLogoUrl + ') left no-repeat',
  'smallLogo': 'url(' + kibanaLogoUrl + ') left no-repeat'
})
.setNavBackground('#222222')
.setTabDefaults({
  resetWhenActive: true,
  lastUrlStore: window.sessionStore,
  activeIndicatorColor: '#656a76'
})
.setTabs([
  {
    id: 'discover',
    title: 'Discover',
    authority: 'OP_KIBANA_DISCOVER'
  },
  {
    id: 'visualize',
    title: 'Visualize',
    authority: 'OP_KIBANA_VISUALIZE',
    activeIndicatorColor: function () {
      return (String(this.lastUrl).indexOf('/visualize/step/') === 0) ? 'white' : '#656a76';
    }
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    authority: 'OP_KIBANA_DASHBOARD'
  },
  {
    id: 'settings',
    title: 'Settings',
    authority: 'OP_KIBANA_SETTINGS'
  }
])
.setShowAppsLink(chrome.getInjected('kbnLoadApps', false))
.setRootController('kibana', function ($scope, $rootScope, courier, config) {
  function setDefaultTimezone() {
    moment.tz.setDefault(config.get('dateFormat:tz'));
  }

  // wait for the application to finish loading
  $scope.$on('application.load', function () {
    courier.start();
  });

  $scope.$on('init:config', setDefaultTimezone);
  $scope.$on('change:config.dateFormat:tz', setDefaultTimezone);
});
