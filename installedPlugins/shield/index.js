const Promise = require('bluebird');
const hapiAuthBasic = require('hapi-auth-basic');
const hapiAuthCookie = require('hapi-auth-cookie');
const root = require('requirefrom')('');
const validateConfig = root('server/lib/validate_config');
const createScheme = root('server/lib/login_scheme');
const basicAuth = root('server/lib/basic_auth');
const _ = require('lodash');

module.exports = (kibana) => new kibana.Plugin({
  name: 'shield',
  require: ['elasticsearch'],

  config(Joi) {
    return Joi.object({
      enabled: Joi.boolean().default(true),
      cookieName: Joi.string().default('sid'),
      encryptionKey: Joi.string(),
      sessionTimeout: Joi.number().default(30 * 60 * 1000),
      clientId: Joi.string(),
      clientSecret: Joi.string(),
      url: Joi.string().uri({scheme: ['http', 'https']}).required().description('Token URL'),
      userUrl: Joi.string().uri({scheme: ['http', 'https']}).required().description('User URL'),
      isSecure: Joi.boolean().default(false),
      user: Joi.string().required(),
      password: Joi.string().required()
    }).default();
  },

  uiExports: {
    injectDefaultVars: function () {
      return {
        isShieldEnabled: true
      };
    },
    chromeNavControls: ['plugins/shield/views/logout_button'],
    apps: [{
      id: 'login',
      title: 'Login',
      main: 'plugins/shield/views/login',
      hidden: true,
      autoload: kibana.autoload.styles,
      injectVars: function (server, options) {
        return {};
      }
    }, {
      id: 'logout',
      title: 'Logout',
      main: 'plugins/shield/views/logout',
      hidden: true,
      autoload: kibana.autoload.styles
    }]
  },

  init(server, options) {
    const config = server.config();
    validateConfig(config, message => server.log(['shield', 'warning'], message));

    const register = Promise.promisify(server.register, {context: server});
    Promise.all([
      register(hapiAuthBasic),
      register(hapiAuthCookie)
    ]).then(() => {
      server.auth.scheme('login', createScheme({
        redirectUrl: () => loginUrl(config.get('server.basePath'), config.get('kibana.defaultAppId')),
        strategies: ['shield-cookie']
      }));

      server.auth.strategy('session', 'login', 'required');

      server.auth.strategy('shield-cookie', 'cookie', false, {
        cookie: config.get('shield.cookieName'),
        password: config.get('shield.encryptionKey'),
        path: config.get('server.basePath') + '/',
        clearInvalid: true,
        isSecure: config.get('shield.isSecure'),
        redirectTo: '/login',
        validateFunc: root('server/lib/validate_cookie')(server)
      });
    });

    const kibanaUserHeaders = basicAuth.getKibanaUserAuthHeader(config.get('shield.user'), config.get('shield.password'));

    server.ext('onPostAuth', function (request, next) {
      if (request.auth && request.auth.isAuthenticated) {
        _.assign(request.headers, kibanaUserHeaders);
        _.set(request, 'headers', _.omit(request.headers, 'origin')); //remove origin header causes issues
      }
      return next.continue();
    });


    root('server/routes/api/v1/authenticate')(server);
    root('server/routes/views/login')(server, this);
    root('server/routes/views/logout')(server, this);
  }
});

function loginUrl(baseUrl, requestedPath) {
  const next = encodeURIComponent(requestedPath);
  return `${baseUrl}/login?next=${next}`;
}
