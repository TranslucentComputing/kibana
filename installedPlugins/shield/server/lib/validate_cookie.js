const root = require('requirefrom')('');

module.exports = (server) => {
  const calculateExpires = root('server/lib/get_calculate_expires')(server);

  return function validate(request, session, callback) {
    const {user,token, expires} = session;
    if (expires < Date.now()) return callback(new Error('Session has expired'), false);

    // If this is a system API call, do NOT extend the session timeout
    // NOTE: The header name is hardcoded here because the code to generate it lives in client-side code (in core
    // Kibana), whereas this code here is server-side and we don't have any code sharing going on at the moment.
    if (!!request.headers['kbn-system-api']) {
      return callback(null, true);
    }

    if (!user || !token) {
      return callback(error, false)
    }

    // Keep the session alive
    request.auth.session.set({
      user: user,
      token: token,
      expires: calculateExpires()
    });

    return callback(null, true, user);
  };
};
