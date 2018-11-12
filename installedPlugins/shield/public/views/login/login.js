require('plugins/shield/views/login/login.less');
const parseNext = require('plugins/shield/lib/parse_next');
const kibanaLogoUrl = require('plugins/shield/images/kibana.svg');

require('ui/chrome')
.setVisible(false)
.setRootTemplate(require('plugins/shield/views/login/login.html'))
.setRootController('login', ($http) => {
  const next = parseNext(window.location);

  return {
    kibanaLogoUrl,
    submit(username, password) {
      $http.post('./api/shield/v1/login',{username,password}).then(
        (response) => window.location.href = `${next}`,
        (error) => this.error = true
      );
    }
  };
});
